-- SETU seed data - run AFTER schema.sql in the Supabase SQL editor.
-- Mirrors src/lib/demo.ts so the live DB matches the local demo preview.
-- Persona logins: <username>@setu.demo / setu-demo-pass  (e.g. arjun_cp@setu.demo)
-- Safe to re-run: wipes every @setu.demo account first; cascades clean up content.

begin;

-- Notification fan-out would spam every demo account on insert; pause it during seed.
alter table doubts disable trigger on_doubt_created;
alter table advice disable trigger on_advice_created;

-- 0. Idempotency: remove previous demo accounts (content cascades).
delete from auth.users where email like '%@setu.demo';

-- 1. The 7 personas. Profiles are auto-created by the on_auth_user_created
--    trigger from raw_user_meta_data (username / display_name / role).
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '5e7a0000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'arjun_cp@setu.demo', crypt('setu-demo-pass', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"arjun_cp","display_name":"Arjun Mehta","role":"senior"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '5e7a0000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'sneha_m@setu.demo', crypt('setu-demo-pass', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"sneha_m","display_name":"Sneha Menon","role":"senior"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '5e7a0000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'rohan_fpl@setu.demo', crypt('setu-demo-pass', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"rohan_fpl","display_name":"Rohan Iyer","role":"junior"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '5e7a0000-0000-4000-8000-000000000004', 'authenticated', 'authenticated',
   'ananya_sings@setu.demo', crypt('setu-demo-pass', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"ananya_sings","display_name":"Ananya Rao","role":"senior"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '5e7a0000-0000-4000-8000-000000000005', 'authenticated', 'authenticated',
   'kabir_j@setu.demo', crypt('setu-demo-pass', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"kabir_j","display_name":"Kabir Shah","role":"junior"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '5e7a0000-0000-4000-8000-000000000006', 'authenticated', 'authenticated',
   'isha_codes@setu.demo', crypt('setu-demo-pass', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"isha_codes","display_name":"Isha Verma","role":"junior"}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '5e7a0000-0000-4000-8000-000000000007', 'authenticated', 'authenticated',
   'dev_bhaiya@setu.demo', crypt('setu-demo-pass', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}',
   '{"username":"dev_bhaiya","display_name":"Dev Patil","role":"senior"}', now(), now());

-- identities rows are what Supabase Auth actually looks up at login.
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select '5e7a1000-0000-4000-8000-00000000000' || substr(u.id::text, 35, 1),
       u.id, u.email,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email', now(), now(), now()
from auth.users u where u.email like '%@setu.demo';

-- 2. Synthetic rater pool (90 accounts, rater_101..rater_190) so rating and
--    follow counts look like a real community. Nobody logs into these.
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select '00000000-0000-0000-0000-000000000000',
       ('5e7a0000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
       'authenticated', 'authenticated',
       'rater_' || i || '@setu.demo',
       crypt('setu-demo-pass', gen_salt('bf')), now(),
       '{"provider":"email","providers":["email"]}',
       jsonb_build_object('username', 'rater_' || i, 'display_name', 'Student ' || i, 'role', 'junior'),
       now(), now()
from generate_series(101, 190) i;

-- 3. Doubts d1-d6 (timestamps match the "ago" labels in demo.ts; Sep 27 2026 = today).
insert into doubts (id, author_id, title, body, tags, is_anonymous, created_at) values
  ('5e7a0000-0000-4000-8000-000000001001', '5e7a0000-0000-4000-8000-000000000003',
   'How do I actually start competitive programming without dying inside?',
   'Second sem, know basic Python. Everyone says ''do CP'' but Codeforces problems feel impossible. Where do you actually START? Like what did week 1 look like for you?',
   array['academics','coding'], false, '2026-09-22 23:58+05:30'),
  ('5e7a0000-0000-4000-8000-000000001002', '5e7a0000-0000-4000-8000-000000000005',
   'Feel like I picked the wrong branch. Anyone else?',
   'Took CS because everyone said to. Six months in and I dread every class. I like the design stuff we do in clubs way more. Is this normal first-year panic or an actual sign?',
   array['life','career'], true, '2026-09-26 16:31+05:30'),
  ('5e7a0000-0000-4000-8000-000000001003', '5e7a0000-0000-4000-8000-000000000006',
   'Best way to learn guitar alongside a full CS schedule?',
   'Bought a guitar in August. It''s been decoration since September. People who actually learned an instrument in college - how? 30 mins a day? Weekends? Classes worth it?',
   array['music','hobbies'], false, '2026-09-25 20:12+05:30'),
  ('5e7a0000-0000-4000-8000-000000001004', '5e7a0000-0000-4000-8000-000000000005',
   'How much do 3rd year internships actually care about CGPA?',
   'Hearing everything from ''8.5+ or forget it'' to ''nobody checks''. What''s the real cutoff situation for decent companies? And what balances out an average CGPA?',
   array['academics','career','internships'], false, '2026-09-27 02:14+05:30'),
  ('5e7a0000-0000-4000-8000-000000001005', '5e7a0000-0000-4000-8000-000000000006',
   'Hostel roommate situation is getting unbearable. What are my options?',
   'Don''t want to start drama but sleep schedule is destroyed, stuff goes missing, and talking hasn''t worked. Can you actually change rooms mid-semester?',
   array['hostel','life'], true, '2026-09-20 22:40+05:30'),
  ('5e7a0000-0000-4000-8000-000000001006', '5e7a0000-0000-4000-8000-000000000003',
   'Football trials next week - what do selectors actually watch for?',
   'College team selections. I play wing. Fitness is decent, first touch is okay-ish. What makes them pick one winger over another?',
   array['football','sports'], false, '2026-09-27 00:03+05:30');

-- 4. Advice a1-a11.
insert into advice (id, doubt_id, author_id, body, created_at) values
  ('5e7a0000-0000-4000-8000-000000002001', '5e7a0000-0000-4000-8000-000000001001', '5e7a0000-0000-4000-8000-000000000001',
   'Week 1 for me was NOT Codeforces. It was solving 5 easy problems a day on the same site until loops/arrays felt boring. Then Codeforces Div 4 contests only. The mistake everyone makes is opening a Div 2 problem, failing, and quitting. Rate yourself at 800 and stay in the 800-1000 pool for a month. It compounds stupidly fast.',
   '2026-09-23 00:20+05:30'),
  ('5e7a0000-0000-4000-8000-000000002002', '5e7a0000-0000-4000-8000-000000001001', '5e7a0000-0000-4000-8000-000000000007',
   'Adding to Arjun''s point - find ONE person at your level and do virtual contests together every Sunday. Accountability beats motivation every single time.',
   '2026-09-23 09:05+05:30'),
  ('5e7a0000-0000-4000-8000-000000002003', '5e7a0000-0000-4000-8000-000000001001', '5e7a0000-0000-4000-8000-000000000005',
   'just grind leetcode hard ones bro, go big or go home',
   '2026-09-23 14:44+05:30'),
  ('5e7a0000-0000-4000-8000-000000002004', '5e7a0000-0000-4000-8000-000000001002', '5e7a0000-0000-4000-8000-000000000002',
   'First-year panic is real but so is your signal. Do this: give CS one honest semester where you build things YOU pick (not assignments), and keep one foot in the design club. By June you''ll know which room you keep walking into voluntarily. That''s your answer. Branch matters way less than what you build in either.',
   '2026-09-26 17:02+05:30'),
  ('5e7a0000-0000-4000-8000-000000002005', '5e7a0000-0000-4000-8000-000000001002', '5e7a0000-0000-4000-8000-000000000004',
   'Was in this exact spot last year. What helped: seniors in the design club let me sit in on real projects. Turned out I liked designing but not the design JOB. Knowing that early saved me years.',
   '2026-09-26 19:48+05:30'),
  ('5e7a0000-0000-4000-8000-000000002006', '5e7a0000-0000-4000-8000-000000001003', '5e7a0000-0000-4000-8000-000000000004',
   '20 minutes EVERY day beats 3 hours on Sunday, no contest. Keep the guitar within arm''s reach of your desk - the friction of opening a case kills more practice than anything. First month: just chord transitions, A-D-E, until your fingers stop hurting. Songs come after that. YouTube (JustinGuitar) is genuinely enough, no classes needed.',
   '2026-09-25 21:30+05:30'),
  ('5e7a0000-0000-4000-8000-000000002007', '5e7a0000-0000-4000-8000-000000001003', '5e7a0000-0000-4000-8000-000000000007',
   'The music room is free 6-8pm most days and seniors there will teach you for free if you just show up consistently. Community > tutorials for staying alive past month 2.',
   '2026-09-26 11:15+05:30'),
  ('5e7a0000-0000-4000-8000-000000002008', '5e7a0000-0000-4000-8000-000000001004', '5e7a0000-0000-4000-8000-000000000007',
   'Reality: most decent companies filter at 7.5-8.0, a few fancy ones at 8.5+. But here''s what nobody tells you - after the filter, CGPA is done, nobody asks again. What balances average grades: one project you can talk about for 20 minutes without notes. Depth beats GPA every interview I''ve sat through.',
   '2026-09-27 03:00+05:30'),
  ('5e7a0000-0000-4000-8000-000000002009', '5e7a0000-0000-4000-8000-000000001004', '5e7a0000-0000-4000-8000-000000000001',
   'Also - off-campus applications skip the college cutoff entirely. My internship came from a GitHub README that a recruiter liked. Sounds fake, isn''t.',
   '2026-09-27 08:41+05:30'),
  ('5e7a0000-0000-4000-8000-000000002010', '5e7a0000-0000-4000-8000-000000001005', '5e7a0000-0000-4000-8000-000000000002',
   'Yes, you can change mid-semester - warden office, written request, they approve within a week if you''re calm and factual (not complaining about the person, just the situation). Missing stuff: mention it to the warden privately NOW, paper trail matters if it escalates. You''re not causing drama, you''re sleeping.',
   '2026-09-21 10:05+05:30'),
  ('5e7a0000-0000-4000-8000-000000002011', '5e7a0000-0000-4000-8000-000000001006', '5e7a0000-0000-4000-8000-000000000004',
   'Talked to the team captain about this once: they watch what you do OFF the ball. Everyone looks good with it. Positioning when you don''t have it, tracking back after losing it, and whether you lift your head before receiving. First touch matters but decision speed matters more.',
   '2026-09-27 01:12+05:30');

-- 5. Accepted answers (the solved doubts): d1->a1, d3->a6, d5->a10.
update doubts set accepted_advice_id = '5e7a0000-0000-4000-8000-000000002001' where id = '5e7a0000-0000-4000-8000-000000001001';
update doubts set accepted_advice_id = '5e7a0000-0000-4000-8000-000000002006' where id = '5e7a0000-0000-4000-8000-000000001003';
update doubts set accepted_advice_id = '5e7a0000-0000-4000-8000-000000002010' where id = '5e7a0000-0000-4000-8000-000000001005';

-- 6. Ratings. Helper spreads a target star-sum across N raters as base/base+1
--    stars so each average matches demo.ts (checked: a1 197/41=4.80, a4 255/52=4.90, ...).
create or replace function _seed_ratings(p_advice uuid, p_count int, p_sum int) returns void as $$
  insert into ratings (advice_id, rater_id, stars)
  select p_advice,
         ('5e7a0000-0000-4000-8000-' || lpad((100 + g)::text, 12, '0'))::uuid,
         case when g <= p_sum - (p_sum / p_count) * p_count
              then (p_sum / p_count) + 1
              else (p_sum / p_count) end
  from generate_series(1, p_count) g;
$$ language sql;

select _seed_ratings('5e7a0000-0000-4000-8000-000000002001', 41, 197); -- a1 4.8
select _seed_ratings('5e7a0000-0000-4000-8000-000000002002', 18,  76); -- a2 4.2
select _seed_ratings('5e7a0000-0000-4000-8000-000000002003',  9,  19); -- a3 2.1
select _seed_ratings('5e7a0000-0000-4000-8000-000000002004', 52, 255); -- a4 4.9
select _seed_ratings('5e7a0000-0000-4000-8000-000000002005', 23, 101); -- a5 4.4
select _seed_ratings('5e7a0000-0000-4000-8000-000000002006', 29, 136); -- a6 4.7
select _seed_ratings('5e7a0000-0000-4000-8000-000000002007', 12,  47); -- a7 3.9
select _seed_ratings('5e7a0000-0000-4000-8000-000000002008', 44, 202); -- a8 4.6
select _seed_ratings('5e7a0000-0000-4000-8000-000000002009', 19,  78); -- a9 4.1
select _seed_ratings('5e7a0000-0000-4000-8000-000000002010', 26, 117); -- a10 4.5
select _seed_ratings('5e7a0000-0000-4000-8000-000000002011', 15,  64); -- a11 4.3

drop function _seed_ratings(uuid, int, int);

-- 7. Follow counts. Autofollow already added author + advisors, so top up from
--    the rater pool to reach the demo totals (d1 34, d2 58, d3 21, d4 87, d5 19, d6 12).
insert into follows (doubt_id, user_id)
select '5e7a0000-0000-4000-8000-000000001001', ('5e7a0000-0000-4000-8000-' || lpad((100 + g)::text, 12, '0'))::uuid
from generate_series(1, 30) g on conflict do nothing;
insert into follows (doubt_id, user_id)
select '5e7a0000-0000-4000-8000-000000001002', ('5e7a0000-0000-4000-8000-' || lpad((100 + g)::text, 12, '0'))::uuid
from generate_series(1, 55) g on conflict do nothing;
insert into follows (doubt_id, user_id)
select '5e7a0000-0000-4000-8000-000000001003', ('5e7a0000-0000-4000-8000-' || lpad((100 + g)::text, 12, '0'))::uuid
from generate_series(1, 18) g on conflict do nothing;
insert into follows (doubt_id, user_id)
select '5e7a0000-0000-4000-8000-000000001004', ('5e7a0000-0000-4000-8000-' || lpad((100 + g)::text, 12, '0'))::uuid
from generate_series(1, 84) g on conflict do nothing;
insert into follows (doubt_id, user_id)
select '5e7a0000-0000-4000-8000-000000001005', ('5e7a0000-0000-4000-8000-' || lpad((100 + g)::text, 12, '0'))::uuid
from generate_series(1, 17) g on conflict do nothing;
insert into follows (doubt_id, user_id)
select '5e7a0000-0000-4000-8000-000000001006', ('5e7a0000-0000-4000-8000-' || lpad((100 + g)::text, 12, '0'))::uuid
from generate_series(1, 10) g on conflict do nothing;

-- 8. Re-enable fan-out and finish.
alter table doubts enable trigger on_doubt_created;
alter table advice enable trigger on_advice_created;

commit;

-- Sanity checks after running:
--   select avg_stars, rating_count from advice_scores;      -- 4.8/41, 4.2/18, 2.1/9, ...
--   select doubt_id, count(*) from follows group by 1;      -- 34, 58, 21, 87, 19, 12
--   select username, role from profiles where username not like 'rater_%';
