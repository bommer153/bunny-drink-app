import { useState, useEffect, useCallback } from 'react'
import { loadPlayers, savePlayers } from '../lib/storage'
import type { Player } from '../lib/storage'

const MAX_PLAYERS = 12

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadPlayers().then((stored) => {
      if (!cancelled) {
        setPlayers(stored)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addPlayer = useCallback((name: string): boolean => {
    const trimmed = name.trim()
    if (!trimmed) return false

    let added = false
    setPlayers((prev) => {
      if (prev.length >= MAX_PLAYERS) return prev
      if (prev.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) return prev
      added = true
      const next = [...prev, { id: crypto.randomUUID(), name: trimmed }]
      savePlayers(next)
      return next
    })
    return added
  }, [])

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => {
      const next = prev.filter((p) => p.id !== id)
      savePlayers(next)
      return next
    })
  }, [])

  const clearPlayers = useCallback(() => {
    setPlayers([])
    savePlayers([])
  }, [])

  return { players, loaded, addPlayer, removePlayer, clearPlayers, maxPlayers: MAX_PLAYERS }
}
