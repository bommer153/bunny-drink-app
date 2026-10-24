import type { IntensityLevel } from '../lib/storage'

export type ChallengeType =
  | 'drink' | 'dare' | 'truth' | 'group' | 'give'
  | 'trivia' | 'likely' | 'never' | 'speed'

export interface Challenge {
  id: string
  type: ChallengeType
  level: IntensityLevel
  text: string
  /** Trivia only: the verified answer and a one-line "Did you know?" */
  answer?: string
  fact?: string
}

export const TYPE_META: Record<
  ChallengeType,
  {
    label: string
    emoji: string
    gradient: string
    seconds?: number    // shows the countdown timer after the reveal
    pickSips?: number   // group vote: each tapped player gets this many sips
    celebrate?: boolean // confetti when completed
  }
> = {
  drink:  { label: 'Drink',             emoji: '🍺', gradient: 'from-amber-400 to-orange-500' },
  dare:   { label: 'Dare',              emoji: '😈', gradient: 'from-purple-500 to-pink-500', seconds: 30, celebrate: true },
  truth:  { label: 'Truth',             emoji: '💬', gradient: 'from-sky-400 to-blue-600'     },
  group:  { label: 'Group',             emoji: '🎉', gradient: 'from-emerald-400 to-teal-500' },
  give:   { label: 'Give Out',          emoji: '🎯', gradient: 'from-rose-400 to-red-600'     },
  trivia: { label: 'Trivia',            emoji: '🧠', gradient: 'from-cyan-400 to-indigo-500', seconds: 15 },
  likely: { label: 'Most Likely To',    emoji: '👉', gradient: 'from-fuchsia-500 to-rose-500', seconds: 3, pickSips: 2 },
  never:  { label: 'Never Have I Ever', emoji: '🙊', gradient: 'from-lime-400 to-emerald-600', pickSips: 1 },
  speed:  { label: 'Speed Round',       emoji: '⚡', gradient: 'from-yellow-300 to-orange-500', seconds: 5, celebrate: true },
}

export type Category = 'mix' | 'tod' | 'trivia' | 'likely' | 'never' | 'speed'

/** `types` omitted = everything */
export const CATEGORIES: { id: Category; label: string; emoji: string; types?: ChallengeType[] }[] = [
  { id: 'mix',    label: 'Mix',               emoji: '🎲' },
  { id: 'tod',    label: 'Truth or Dare',     emoji: '😈', types: ['truth', 'dare', 'drink', 'give', 'group'] },
  { id: 'trivia', label: 'Trivia',            emoji: '🧠', types: ['trivia'] },
  { id: 'likely', label: 'Most Likely To',    emoji: '👉', types: ['likely'] },
  { id: 'never',  label: 'Never Have I Ever', emoji: '🙊', types: ['never'] },
  { id: 'speed',  label: 'Speed Round',       emoji: '⚡', types: ['speed'] },
]

const CHALLENGES: Challenge[] = [
  // ── Drink ──────────────────────────────────────────────────────────
  { id: 'dk-1-1', type: 'drink', level: 1, text: 'Take 1 sip.' },
  { id: 'dk-1-2', type: 'drink', level: 1, text: 'Take 2 sips.' },
  { id: 'dk-1-3', type: 'drink', level: 1, text: 'Finish your drink if it\'s less than a quarter full.' },
  { id: 'dk-1-4', type: 'drink', level: 1, text: 'Drink once for every vowel in your first name.' },
  { id: 'dk-2-1', type: 'drink', level: 2, text: 'Take 3 big sips back-to-back.' },
  { id: 'dk-2-2', type: 'drink', level: 2, text: 'Waterfall — everyone starts drinking; no one stops until you stop.' },
  { id: 'dk-2-3', type: 'drink', level: 2, text: 'Take a shot, or drink for 3 full seconds.' },
  { id: 'dk-2-4', type: 'drink', level: 2, text: 'Drink once for each lie you\'ve told tonight (honour system).' },
  { id: 'dk-3-1', type: 'drink', level: 3, text: 'Finish your entire drink. No excuses.' },
  { id: 'dk-3-2', type: 'drink', level: 3, text: 'Mix two random drinks on the table into one glass and down it.' },
  { id: 'dk-3-3', type: 'drink', level: 3, text: 'Chug for 5 seconds while the group counts aloud.' },
  { id: 'dk-3-4', type: 'drink', level: 3, text: 'Drink — and maintain unbroken eye contact with someone the whole time.' },

  // ── Dare ───────────────────────────────────────────────────────────
  { id: 'dr-1-1', type: 'dare', level: 1, text: 'Do your best celebrity impression. Group votes thumbs-up/down.' },
  { id: 'dr-1-2', type: 'dare', level: 1, text: 'Show the group the most embarrassing photo on your phone right now.' },
  { id: 'dr-1-3', type: 'dare', level: 1, text: 'Speak in an accent of the group\'s choice for the next 2 full rounds.' },
  { id: 'dr-1-4', type: 'dare', level: 1, text: 'Let the person to your left add one fake contact to your phone.' },
  { id: 'dr-2-1', type: 'dare', level: 2, text: 'Do 15 push-ups right now, or drink 2.' },
  { id: 'dr-2-2', type: 'dare', level: 2, text: 'Text your most recent ex "Hey, thinking of you 👀" — show the screen first.' },
  { id: 'dr-2-3', type: 'dare', level: 2, text: 'Let the group post one photo or story from your phone on your behalf.' },
  { id: 'dr-2-4', type: 'dare', level: 2, text: 'Twerk for 20 full seconds. Full commitment or drink 3.' },
  { id: 'dr-3-1', type: 'dare', level: 3, text: 'Call someone outside this room and sing them Happy Birthday — even if it\'s not their birthday.' },
  { id: 'dr-3-2', type: 'dare', level: 3, text: 'Let the group compose and post a tweet or status from your account.' },
  { id: 'dr-3-3', type: 'dare', level: 3, text: 'Do a full body worm across the entire room. No half-measures.' },
  { id: 'dr-3-4', type: 'dare', level: 3, text: 'Give a 60-second TED talk on a topic the group picks.' },

  // ── Truth ──────────────────────────────────────────────────────────
  { id: 'tr-1-1', type: 'truth', level: 1, text: 'What\'s your most embarrassing drunk moment?' },
  { id: 'tr-1-2', type: 'truth', level: 1, text: 'Who in this room would you trust to bail you out of jail?' },
  { id: 'tr-1-3', type: 'truth', level: 1, text: 'What\'s something you once thought was cool but now cringe at?' },
  { id: 'tr-1-4', type: 'truth', level: 1, text: 'What\'s a bad habit you secretly still have?' },
  { id: 'tr-2-1', type: 'truth', level: 2, text: 'What\'s the wildest thing you\'ve ever done for love — or lust?' },
  { id: 'tr-2-2', type: 'truth', level: 2, text: 'Who in this room would you swap lives with for a week, and why?' },
  { id: 'tr-2-3', type: 'truth', level: 2, text: 'What\'s the biggest lie you\'ve told someone close to you?' },
  { id: 'tr-2-4', type: 'truth', level: 2, text: 'What\'s a secret you\'ve kept from your best friend?' },
  { id: 'tr-3-1', type: 'truth', level: 3, text: 'What\'s the most illegal thing you\'ve ever done? Details required.' },
  { id: 'tr-3-2', type: 'truth', level: 3, text: 'Confess something you\'ve never told anyone in this room — no skipping.' },
  { id: 'tr-3-3', type: 'truth', level: 3, text: 'What\'s the most embarrassing thing your own body has done in public?' },
  { id: 'tr-3-4', type: 'truth', level: 3, text: 'Who here do you think secretly dislikes you, and why?' },

  // ── Group ──────────────────────────────────────────────────────────
  { id: 'gr-1-1', type: 'group', level: 1, text: 'Everyone takes a group selfie. It must be posted to at least one person\'s story.' },
  { id: 'gr-1-2', type: 'group', level: 1, text: 'Everyone says one genuine compliment about the player — they can\'t argue with it.' },
  { id: 'gr-1-3', type: 'group', level: 1, text: 'Group vote: most likely to become famous? That person drinks.' },
  { id: 'gr-1-4', type: 'group', level: 1, text: 'Arm-wrestle the person to your right. Loser takes 2 sips.' },
  { id: 'gr-2-1', type: 'group', level: 2, text: 'Everyone must simultaneously act out their most embarrassing moment — go!' },
  { id: 'gr-2-2', type: 'group', level: 2, text: 'Group vote: worst dancer in the room? That person must dance alone for 30 seconds.' },
  { id: 'gr-2-3', type: 'group', level: 2, text: 'Thumb-war tournament. Last player standing assigns 4 sips however they like.' },
  { id: 'gr-2-4', type: 'group', level: 2, text: 'Everyone writes a text they\'d send their ex on a napkin. Group reads aloud.' },
  { id: 'gr-3-1', type: 'group', level: 3, text: 'Speed-roast round: everyone roasts the player in 10 seconds. Group votes best roast; that person gets 3 sips back.' },
  { id: 'gr-3-2', type: 'group', level: 3, text: 'Group vote: who\'s hiding the biggest secret? That person must answer a truth from any player.' },
  { id: 'gr-3-3', type: 'group', level: 3, text: 'The player picks a dare for themselves. The group bids how many sips they\'d pay to see it. Player must do it.' },
  { id: 'gr-3-4', type: 'group', level: 3, text: 'Every other player must do the same dare as the player. No excuses.' },

  // ── Give Out ───────────────────────────────────────────────────────
  { id: 'gv-1-1', type: 'give', level: 1, text: 'Give out 2 sips to anyone you choose.' },
  { id: 'gv-1-2', type: 'give', level: 1, text: 'Make a rule right now. Anyone who breaks it this round drinks once.' },
  { id: 'gv-1-3', type: 'give', level: 1, text: 'Point at two players — they swap drinks for the rest of this round.' },
  { id: 'gv-1-4', type: 'give', level: 1, text: 'Give 1 sip each to the first two people who make eye contact with you.' },
  { id: 'gv-2-1', type: 'give', level: 2, text: 'Distribute 5 sips any way you like — all to one person, or split up.' },
  { id: 'gv-2-2', type: 'give', level: 2, text: 'You\'re immune this round. Assign a different player to skip their next spin.' },
  { id: 'gv-2-3', type: 'give', level: 2, text: 'Pick someone to finish what\'s left in their glass right now.' },
  { id: 'gv-2-4', type: 'give', level: 2, text: 'Make a rule that stays active until the next Give Out card appears.' },
  { id: 'gv-3-1', type: 'give', level: 3, text: 'Give out a full drink to one person. They choose: chug it, or do a dare of your choice.' },
  { id: 'gv-3-2', type: 'give', level: 3, text: 'You\'re the judge — assign a truth OR dare to every other player simultaneously.' },
  { id: 'gv-3-3', type: 'give', level: 3, text: 'Assign 3 sips to each person who can\'t name all current players in under 5 seconds.' },
  { id: 'gv-3-4', type: 'give', level: 3, text: 'Pick someone: they drink 4 sips AND must whisper a secret only you can hear.' },

  // ── Extra dares (20 total across 4 tiers) ──────────────────────────
  { id: 'dr-1-5', type: 'dare', level: 1, text: 'Talk like a pirate until your next turn. Every slip-up is a sip.' },
  { id: 'dr-2-5', type: 'dare', level: 2, text: 'Let the group scroll your camera roll for 30 seconds — no grabbing the phone back.' },
  { id: 'dr-3-5', type: 'dare', level: 3, text: 'Let the player on your right style your hair however they want. It stays for 3 rounds.' },
  { id: 'dr-4-1', type: 'dare', level: 4, text: 'Read your last 5 sent texts out loud. No context allowed.' },
  { id: 'dr-4-2', type: 'dare', level: 4, text: 'Call a parent and announce you\'re quitting everything to become a professional mime. Stay on for 30 seconds.' },
  { id: 'dr-4-3', type: 'dare', level: 4, text: 'The group picks your phone wallpaper. It stays until tomorrow.' },
  { id: 'dr-4-4', type: 'dare', level: 4, text: 'Swap one item of clothing with the player on your left for the rest of the game.' },
  { id: 'dr-4-5', type: 'dare', level: 4, text: 'Let the group read today\'s search history out loud.' },

  // ── Extreme tier for the classic types ─────────────────────────────
  { id: 'dk-4-1', type: 'drink', level: 4, text: 'Finish your drink. Everyone who laughs while you do it takes 1.' },
  { id: 'tr-4-1', type: 'truth', level: 4, text: 'Rank everyone in this room by how much you\'d trust them with a secret. Out loud.' },
  { id: 'tr-4-2', type: 'truth', level: 4, text: 'Show your screen-time report and explain your #1 app.' },
  { id: 'gr-4-1', type: 'group', level: 4, text: 'Everyone hands their unlocked phone to the left for 60 seconds. No posting — just judging.' },
  { id: 'gv-4-1', type: 'give', level: 4, text: 'Pick one player: they finish their drink, or answer any truth you ask.' },

  // ── Trivia (fact-checked; level 1 so it shows at every intensity) ──
  { id: 'tv-01', type: 'trivia', level: 1, text: 'How many hearts does an octopus have?', answer: '3', fact: 'Two pump blood through the gills, one serves the body — and that one stops while it swims, so octopuses prefer crawling.' },
  { id: 'tv-02', type: 'trivia', level: 1, text: 'What is the only mammal capable of true powered flight?', answer: 'The bat', fact: 'Flying squirrels just glide — they\'re basically furry paper planes.' },
  { id: 'tv-03', type: 'trivia', level: 1, text: 'Which is botanically a berry: a banana or a strawberry?', answer: 'Banana', fact: 'Strawberries aren\'t true berries at all — they wear their seeds on the outside like a bad tattoo.' },
  { id: 'tv-04', type: 'trivia', level: 1, text: 'How many bones are in the adult human body?', answer: '206', fact: 'Babies start with around 300; many fuse as you grow — the original merger.' },
  { id: 'tv-05', type: 'trivia', level: 1, text: 'What is the chemical symbol for gold?', answer: 'Au', fact: 'It comes from the Latin "aurum", meaning shining dawn — fancier than "Go".' },
  { id: 'tv-06', type: 'trivia', level: 1, text: 'What is the hottest planet in our solar system?', answer: 'Venus', fact: 'Its thick CO₂ atmosphere traps heat, making it hotter than Mercury despite being twice as far from the Sun.' },
  { id: 'tv-07', type: 'trivia', level: 1, text: 'In what year did the Titanic sink?', answer: '1912', fact: 'It sank on its maiden voyage, after hitting an iceberg on the night of April 14.' },
  { id: 'tv-08', type: 'trivia', level: 1, text: 'What is the smallest country in the world by area?', answer: 'Vatican City', fact: 'At about 0.44 km², it\'s smaller than many golf courses.' },
  { id: 'tv-09', type: 'trivia', level: 1, text: 'What is the capital of Australia?', answer: 'Canberra', fact: 'It was purpose-built as a compromise because Sydney and Melbourne couldn\'t stop arguing.' },
  { id: 'tv-10', type: 'trivia', level: 1, text: 'What is the largest ocean on Earth?', answer: 'The Pacific', fact: 'It covers more area than all of Earth\'s land combined.' },
  { id: 'tv-11', type: 'trivia', level: 1, text: 'Which animal has fingerprints almost identical to humans?', answer: 'The koala', fact: 'They\'re so similar that even under a microscope they\'re hard to tell apart — perfect alibi material.' },
  { id: 'tv-12', type: 'trivia', level: 1, text: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci', fact: 'It was stolen from the Louvre in 1911 — the theft is a big part of why it became so famous.' },
  { id: 'tv-13', type: 'trivia', level: 1, text: 'Roughly how long does sunlight take to reach Earth?', answer: 'About 8 minutes', fact: 'About 8 min 20 s — so you\'re always seeing the Sun slightly in the past.' },
  { id: 'tv-14', type: 'trivia', level: 1, text: 'What is the largest planet in our solar system?', answer: 'Jupiter', fact: 'It\'s more than twice as massive as all the other planets combined.' },
  { id: 'tv-15', type: 'trivia', level: 1, text: 'Which country spans the most time zones, counting overseas territories?', answer: 'France', fact: 'Thanks to its overseas territories, France covers 12 time zones — Russia only has 11.' },
  { id: 'tv-16', type: 'trivia', level: 1, text: 'What is the hardest naturally occurring material?', answer: 'Diamond', fact: 'It\'s pure carbon — the same stuff as pencil graphite, just better organised.' },

  // ── Most Likely To ─────────────────────────────────────────────────
  { id: 'ml-1-1', type: 'likely', level: 1, text: 'Who\'s most likely to survive a zombie apocalypse?' },
  { id: 'ml-1-2', type: 'likely', level: 1, text: 'Who\'s most likely to cry at a dog-food commercial?' },
  { id: 'ml-1-3', type: 'likely', level: 1, text: 'Who\'s most likely to become famous for something ridiculous?' },
  { id: 'ml-2-1', type: 'likely', level: 2, text: 'Who\'s most likely to text their ex tonight?' },
  { id: 'ml-2-2', type: 'likely', level: 2, text: 'Who\'s most likely to get kicked out of a bar?' },
  { id: 'ml-3-1', type: 'likely', level: 3, text: 'Who\'s most likely to have a secret social media account?' },
  { id: 'ml-3-2', type: 'likely', level: 3, text: 'Who\'s most likely to marry someone they met this week?' },
  { id: 'ml-4-1', type: 'likely', level: 4, text: 'Who\'s most likely to be wanted in three countries?' },

  // ── Never Have I Ever ──────────────────────────────────────────────
  { id: 'nv-1-1', type: 'never', level: 1, text: 'Never have I ever faked a phone call to avoid someone.' },
  { id: 'nv-1-2', type: 'never', level: 1, text: 'Never have I ever fallen asleep in a class or meeting.' },
  { id: 'nv-1-3', type: 'never', level: 1, text: 'Never have I ever re-gifted a present.' },
  { id: 'nv-2-1', type: 'never', level: 2, text: 'Never have I ever stalked an ex\'s new partner online.' },
  { id: 'nv-2-2', type: 'never', level: 2, text: 'Never have I ever sent a text to the wrong person.' },
  { id: 'nv-2-3', type: 'never', level: 2, text: 'Never have I ever lied about my age.' },
  { id: 'nv-3-1', type: 'never', level: 3, text: 'Never have I ever been kicked out of somewhere.' },
  { id: 'nv-3-2', type: 'never', level: 3, text: 'Never have I ever kissed someone in this room.' },
  { id: 'nv-4-1', type: 'never', level: 4, text: 'Never have I ever woken up with no idea how I got home.' },

  // ── Speed Round (5-second rule) ────────────────────────────────────
  { id: 'sp-1-1', type: 'speed', level: 1, text: 'Name 3 Disney movies!' },
  { id: 'sp-1-2', type: 'speed', level: 1, text: 'Name 3 countries starting with "S"!' },
  { id: 'sp-1-3', type: 'speed', level: 1, text: 'Name 3 pizza toppings!' },
  { id: 'sp-1-4', type: 'speed', level: 1, text: 'Name 3 things you\'d find in a fridge!' },
  { id: 'sp-2-1', type: 'speed', level: 2, text: 'Name 3 apps on the phone of the player to your left — they confirm!' },
  { id: 'sp-2-2', type: 'speed', level: 2, text: 'Name 3 brands of beer!' },
  { id: 'sp-3-1', type: 'speed', level: 3, text: 'Name 3 exes of anyone in this room!' },
  { id: 'sp-4-1', type: 'speed', level: 4, text: 'Name 3 people in this room you\'ve seen cry!' },
]

// Ids already shown this session, so cards don't repeat until a pool runs dry.
const seen = new Set<string>()

/** Picks a random unseen challenge at or below `level`, limited to the category's types. */
export function pickChallenge(level: IntensityLevel, category: Category): Challenge {
  const types = CATEGORIES.find((c) => c.id === category)?.types
  const pool = CHALLENGES.filter((c) => c.level <= level && (!types || types.includes(c.type)))
  let fresh = pool.filter((c) => !seen.has(c.id))
  if (fresh.length === 0) {
    pool.forEach((c) => seen.delete(c.id))
    fresh = pool
  }
  const pick = fresh[Math.floor(Math.random() * fresh.length)]
  seen.add(pick.id)
  return pick
}
