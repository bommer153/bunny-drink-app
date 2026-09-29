import type { IntensityLevel } from '../lib/storage'

export type ChallengeType = 'drink' | 'dare' | 'truth' | 'group' | 'give'

export interface Challenge {
  id: string
  type: ChallengeType
  level: IntensityLevel
  text: string
}

export const TYPE_META: Record<
  ChallengeType,
  { label: string; emoji: string; gradient: string }
> = {
  drink: { label: 'Drink',    emoji: '🍺', gradient: 'from-amber-400 to-orange-500' },
  dare:  { label: 'Dare',     emoji: '😈', gradient: 'from-purple-500 to-pink-500'  },
  truth: { label: 'Truth',    emoji: '💬', gradient: 'from-sky-400 to-blue-600'     },
  group: { label: 'Group',    emoji: '🎉', gradient: 'from-emerald-400 to-teal-500' },
  give:  { label: 'Give Out', emoji: '🎯', gradient: 'from-rose-400 to-red-600'     },
}

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
]

/** Returns all challenges at or below the chosen intensity level, then picks one at random. */
export function pickChallenge(level: IntensityLevel): Challenge {
  const pool = CHALLENGES.filter((c) => c.level <= level)
  return pool[Math.floor(Math.random() * pool.length)]
}
