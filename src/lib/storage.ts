import { get, set } from 'idb-keyval'

export interface Player {
  id: string
  name: string
}

/** 1 = Chill, 2 = Spicy, 3 = Chaos */
export type IntensityLevel = 1 | 2 | 3

const PLAYERS_KEY = 'bdg:players'
const INTENSITY_KEY = 'bdg:intensity'

export async function loadPlayers(): Promise<Player[]> {
  return (await get<Player[]>(PLAYERS_KEY)) ?? []
}

export async function savePlayers(players: Player[]): Promise<void> {
  await set(PLAYERS_KEY, players)
}

export async function loadIntensity(): Promise<IntensityLevel> {
  return (await get<IntensityLevel>(INTENSITY_KEY)) ?? 1
}

export async function saveIntensity(level: IntensityLevel): Promise<void> {
  await set(INTENSITY_KEY, level)
}
