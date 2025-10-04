'use client'

import { useEffect } from 'react'
import { useTimerStore, useSettingsStore } from '@/store'

export const useTimerSync = () => {
  const { resetTimer, timerState } = useTimerStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    if (timerState === 'idle') {
      resetTimer()
    }
  }, [settings.timer, timerState, resetTimer])

  return { settings }
}