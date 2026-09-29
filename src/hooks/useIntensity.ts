import { useState, useEffect, useCallback } from 'react'
import { loadIntensity, saveIntensity } from '../lib/storage'
import type { IntensityLevel } from '../lib/storage'

export function useIntensity() {
  const [intensity, setIntensityState] = useState<IntensityLevel>(1)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadIntensity().then((level) => {
      if (!cancelled) {
        setIntensityState(level)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const setIntensity = useCallback((level: IntensityLevel) => {
    setIntensityState(level)
    saveIntensity(level)
  }, [])

  return { intensity, setIntensity, loaded }
}
