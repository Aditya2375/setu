-- SETU database schema - run in the Supabase SQL editor once.
-- Tables, relationships, row-level security, scoring views, seed community.

-- PROFILES (extends Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  role text not null check (role in ('junior','senior')),
  bio text default '',
  created_at timestamptz default now()
);

-- auto-create a profile on signup
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text,1,8)),
          coalesce(new.raw_user_meta_data->>'display_name', 'New User'),
          coalesce(new.raw_user_meta_data->>'role', 'junior'));
  return new;
end; $$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- DOUBTS
create table if not exists doubts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  tags text[] default '{}',
  is_anonymous boolean default false,
  accepted_advice_id uuid,
  created_at timestamptz default now()
);
create index if not exists doubts_created_idx on doubts(created_at desc);
create index if not exists doubts_tags_idx on doubts using gin(tags);

-- ADVICE
create table if not exists advice (
  id uuid primary key default gen_random_uuid(),
  doubt_id uuid not null references doubts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);
create index if not exists advice_doubt_idx on advice(doubt_id);

-- RATINGS (1-5 stars on advice, one per user per advice)
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  advice_id uuid not null references advice(id) on delete cascade,
  rater_id uuid not null references profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz default now(),
  unique(advice_id, rater_id)
);

-- FOLLOWS (follow a doubt)
create table if not exists follows (
  doubt_id uuid not null references doubts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (doubt_id, user_id)
);

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null, -- new_doubt / new_advice / accepted / milestone
  doubt_id uuid references doubts(id) on delete cascade,
  advice_id uuid references advice(id) on delete cascade,
  text text not null,
  read boolean default false,
  created_at timestamptz default now()
);
create index if not exists notif_user_idx on notifications(user_id, created_at desc);

-- REPORTS
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  doubt_id uuid references doubts(id) on delete cascade,
  advice_id uuid references advice(id) on delete cascade,
  reason text default '',
  created_at timestamptz default now(),
  unique(reporter_id, doubt_id, advice_id)
);

-- SCORING: average stars + count per advice
create or replace view advice_scores as
select a.id as advice_id, a.doubt_id, a.author_id,
       coalesce(avg(r.stars), 0) as avg_stars,
       count(r.id) as rating_count
from advice a left join ratings r on r.advice_id = a.id
group by a.id, a.doubt_id, a.author_id;

-- PROFILE SCORES: average across all advice the user wrote
create or replace view profile_scores as
select p.id as user_id,
       coalesce(avg(r.stars), 0)::numeric(3,2) as avg_stars,
       count(r.id) as rating_count,
       count(distinct a.id) as advice_count
from profiles p
left join advice a on a.author_id = p.id
left join ratings r on r.advice_id = a.id
group by p.id;

-- The 2-star threshold: below 2.0 avg with >=5 ratings => 7-day cooldown
create or replace view advice_cooldowns as
select user_id from profile_scores
where rating_count >= 5 and avg_stars < 2.0;

-- RLS
alter table profiles enable row level security;
alter table doubts enable row level security;
alter table advice enable row level security;
alter table ratings enable row level security;
alter table follows enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;

create policy "profiles readable" on profiles for select using (true);
create policy "own profile editable" on profiles for update using (auth.uid() = id);
create policy "doubts readable" on doubts for select using (true);
create policy "post doubts" on doubts for insert with check (auth.uid() = author_id);
create policy "edit own doubt" on doubts for update using (auth.uid() = author_id);
create policy "advice readable" on advice for select using (true);
create policy "post advice unless cooldown" on advice for insert
  with check (auth.uid() = author_id and auth.uid() not in (select user_id from advice_cooldowns));
create policy "ratings readable" on ratings for select using (true);
create policy "rate advice" on ratings for insert with check (auth.uid() = rater_id);
create policy "change own rating" on ratings for update using (auth.uid() = rater_id);
create policy "follows readable" on follows for select using (true);
create policy "follow" on follows for insert with check (auth.uid() = user_id);
create policy "unfollow" on follows for delete using (auth.uid() = user_id);
create policy "own notifications" on notifications for select using (auth.uid() = user_id);
create policy "mark read" on notifications for update using (auth.uid() = user_id);
create policy "report" on reports for insert with check (auth.uid() = reporter_id);
create policy "reports readable own" on reports for select using (auth.uid() = reporter_id);

-- NOTIFICATION FAN-OUT: new doubt -> notify everyone except author
create or replace function notify_new_doubt() returns trigger as $$
begin
  insert into notifications (user_id, kind, doubt_id, text)
  select id, 'new_doubt', new.id,
         'New doubt: ' || left(new.title, 80)
  from profiles where id <> new.author_id;
  return new;
end; $$ language plpgsql security definer;
drop trigger if exists on_doubt_created on doubts;
create trigger on_doubt_created after insert on doubts
  for each row execute function notify_new_doubt();

-- new advice -> notify followers + doubt author
create or replace function notify_new_advice() returns trigger as $$
declare d doubts%rowtype;
begin
  select * into d from doubts where id = new.doubt_id;
  insert into notifications (user_id, kind, doubt_id, advice_id, text)
  select distinct u.user_id, 'new_advice', new.doubt_id, new.id,
         'New advice on: ' || left(d.title, 70)
  from (
    select user_id from follows where doubt_id = new.doubt_id
    union select d.author_id
  ) u
  where u.user_id <> new.author_id;
  return new;
end; $$ language plpgsql security definer;
drop trigger if exists on_advice_created on advice;
create trigger on_advice_created after insert on advice
  for each row execute function notify_new_advice();

-- auto-follow: author follows own doubt; advisor follows too
create or replace function autofollow() returns trigger as $$
begin
  if tg_table_name = 'doubts' then
    insert into follows (doubt_id, user_id) values (new.id, new.author_id) on conflict do nothing;
  else
    insert into follows (doubt_id, user_id) values (new.doubt_id, new.author_id) on conflict do nothing;
  end if;
  return new;
end; $$ language plpgsql security definer;
drop trigger if exists autofollow_doubt on doubts;
create trigger autofollow_doubt after insert on doubts for each row execute function autofollow();
drop trigger if exists autofollow_advice on advice;
create trigger autofollow_advice after insert on advice for each row execute function autofollow();