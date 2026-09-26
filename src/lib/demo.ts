// Demo data - doubles as the seed source for the live database.
// Rendered when Supabase env vars are absent (local preview).

export interface Persona { username: string; name: string; role: "junior" | "senior"; flair?: boolean; }
export interface DemoAdvice { id: string; author: Persona; body: string; stars: number; ratings: number; accepted?: boolean; }
export interface DemoDoubt {
  id: string; author: Persona | null; title: string; body: string;
  tags: string[]; solved: boolean; advice: DemoAdvice[]; follows: number; ago: string; anonymous?: boolean;
}

export const personas: Record<string, Persona> = {
  arjun: { username: "arjun_cp", name: "Arjun Mehta", role: "senior", flair: true },
  sneha: { username: "sneha_m", name: "Sneha Menon", role: "senior", flair: true },
  rohan: { username: "rohan_fpl", name: "Rohan Iyer", role: "junior" },
  ananya: { username: "ananya_sings", name: "Ananya Rao", role: "senior" },
  kabir: { username: "kabir_j", name: "Kabir Shah", role: "junior" },
  isha: { username: "isha_codes", name: "Isha Verma", role: "junior" },
  dev: { username: "dev_bhaiya", name: "Dev Patil", role: "senior", flair: true },
};

export const demoDoubts: DemoDoubt[] = [
  {
    id: "d1", author: personas.rohan, title: "How do I actually start competitive programming without dying inside?",
    body: "Second sem, know basic Python. Everyone says 'do CP' but Codeforces problems feel impossible. Where do you actually START? Like what did week 1 look like for you?",
    tags: ["academics", "coding"], solved: true, follows: 34, ago: "tue, 11:58 PM",
    advice: [
      { id: "a1", author: personas.arjun, stars: 4.8, ratings: 41, accepted: true,
        body: "Week 1 for me was NOT Codeforces. It was solving 5 easy problems a day on the same site until loops/arrays felt boring. Then Codeforces Div 4 contests only. The mistake everyone makes is opening a Div 2 problem, failing, and quitting. Rate yourself at 800 and stay in the 800-1000 pool for a month. It compounds stupidly fast." },
      { id: "a2", author: personas.dev, stars: 4.2, ratings: 18,
        body: "Adding to Arjun's point - find ONE person at your level and do virtual contests together every Sunday. Accountability beats motivation every single time." },
      { id: "a3", author: personas.kabir, stars: 2.1, ratings: 9,
        body: "just grind leetcode hard ones bro, go big or go home" },
    ],
  },
  {
    id: "d2", author: null, anonymous: true, title: "Feel like I picked the wrong branch. Anyone else?",
    body: "Took CS because everyone said to. Six months in and I dread every class. I like the design stuff we do in clubs way more. Is this normal first-year panic or an actual sign?",
    tags: ["life", "career"], solved: false, follows: 58, ago: "yesterday, 4:31 PM",
    advice: [
      { id: "a4", author: personas.sneha, stars: 4.9, ratings: 52,
        body: "First-year panic is real but so is your signal. Do this: give CS one honest semester where you build things YOU pick (not assignments), and keep one foot in the design club. By June you'll know which room you keep walking into voluntarily. That's your answer. Branch matters way less than what you build in either." },
      { id: "a5", author: personas.ananya, stars: 4.4, ratings: 23,
        body: "Was in this exact spot last year. What helped: seniors in the design club let me sit in on real projects. Turned out I liked designing but not the design JOB. Knowing that early saved me years." },
    ],
  },
  {
    id: "d3", author: personas.isha, title: "Best way to learn guitar alongside a full CS schedule?",
    body: "Bought a guitar in August. It's been decoration since September. People who actually learned an instrument in college - how? 30 mins a day? Weekends? Classes worth it?",
    tags: ["music", "hobbies"], solved: true, follows: 21, ago: "last fri, 8:12 PM",
    advice: [
      { id: "a6", author: personas.ananya, stars: 4.7, ratings: 29, accepted: true,
        body: "20 minutes EVERY day beats 3 hours on Sunday, no contest. Keep the guitar within arm's reach of your desk - the friction of opening a case kills more practice than anything. First month: just chord transitions, A-D-E, until your fingers stop hurting. Songs come after that. YouTube (JustinGuitar) is genuinely enough, no classes needed." },
      { id: "a7", author: personas.dev, stars: 3.9, ratings: 12,
        body: "The music room is free 6-8pm most days and seniors there will teach you for free if you just show up consistently. Community > tutorials for staying alive past month 2." },
    ],
  },
  {
    id: "d4", author: personas.kabir, title: "How much do 3rd year internships actually care about CGPA?",
    body: "Hearing everything from '8.5+ or forget it' to 'nobody checks'. What's the real cutoff situation for decent companies? And what balances out an average CGPA?",
    tags: ["academics", "career", "internships"], solved: false, follows: 87, ago: "today, 2:14 AM",
    advice: [
      { id: "a8", author: personas.dev, stars: 4.6, ratings: 44,
        body: "Reality: most decent companies filter at 7.5-8.0, a few fancy ones at 8.5+. But here's what nobody tells you - after the filter, CGPA is done, nobody asks again. What balances average grades: one project you can talk about for 20 minutes without notes. Depth beats GPA every interview I've sat through." },
      { id: "a9", author: personas.arjun, stars: 4.1, ratings: 19,
        body: "Also - off-campus applications skip the college cutoff entirely. My internship came from a GitHub README that a recruiter liked. Sounds fake, isn't." },
    ],
  },
  {
    id: "d5", author: null, anonymous: true, title: "Hostel roommate situation is getting unbearable. What are my options?",
    body: "Don't want to start drama but sleep schedule is destroyed, stuff goes missing, and talking hasn't worked. Can you actually change rooms mid-semester?",
    tags: ["hostel", "life"], solved: true, follows: 19, ago: "sun, 10:40 PM",
    advice: [
      { id: "a10", author: personas.sneha, stars: 4.5, ratings: 26, accepted: true,
        body: "Yes, you can change mid-semester - warden office, written request, they approve within a week if you're calm and factual (not complaining about the person, just the situation). Missing stuff: mention it to the warden privately NOW, paper trail matters if it escalates. You're not causing drama, you're sleeping." },
    ],
  },
  {
    id: "d6", author: personas.rohan, title: "Football trials next week - what do selectors actually watch for?",
    body: "College team selections. I play wing. Fitness is decent, first touch is okay-ish. What makes them pick one winger over another?",
    tags: ["football", "sports"], solved: false, follows: 12, ago: "today, 12:03 AM",
    advice: [
      { id: "a11", author: personas.ananya, stars: 4.3, ratings: 15,
        body: "Talked to the team captain about this once: they watch what you do OFF the ball. Everyone looks good with it. Positioning when you don't have it, tracking back after losing it, and whether you lift your head before receiving. First touch matters but decision speed matters more." },
    ],
  },
];

export const demoTrending = ["d4", "d2", "d1"];

export function starString(avg: number, max = 5): string {
  const full = Math.round(avg);
  return "★".repeat(full) + "★".repeat(Math.max(0, max - full));
}