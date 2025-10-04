import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { SessionType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Time formatting utilities for the timer
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function formatTimeForTitle(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Convert minutes to seconds
export function minutesToSeconds(minutes: number): number {
  return minutes * 60
}

// Get greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

// Calculate estimated finish time
export function calculateFinishTime(tasks: Array<{ estPomodoros: number; isCompleted: boolean }>, pomodoroMinutes: number, shortBreakMinutes: number, longBreakMinutes: number, longBreakInterval: number): Date {
  const incompleteTasks = tasks.filter(task => !task.isCompleted)
  const totalPomodoros = incompleteTasks.reduce((sum, task) => sum + task.estPomodoros, 0)
  
  if (totalPomodoros === 0) return new Date()
  
  // Calculate total time needed
  const longBreaks = Math.floor((totalPomodoros - 1) / longBreakInterval)
  const shortBreaks = totalPomodoros - 1 - longBreaks
  
  const totalMinutes = 
    totalPomodoros * pomodoroMinutes +
    shortBreaks * shortBreakMinutes +
    longBreaks * longBreakMinutes
  
  const finishTime = new Date()
  finishTime.setMinutes(finishTime.getMinutes() + totalMinutes)
  
  return finishTime
}

// Session utilities
export const getSessionTypeColor = (sessionType?: SessionType) => {
  const type = sessionType || 'pomodoro'
  switch (type) {
    case 'pomodoro':
      return { color: '#ef4444' } // Red
    case 'short_break':
      return { color: '#10b981' } // Green
    case 'long_break':
      return { color: '#3b82f6' } // Blue
    default:
      return { color: '#ef4444' }
  }
}

export const getSessionTypeDisplay = (sessionType?: SessionType): string => {
  const type = sessionType || 'pomodoro'
  switch (type) {
    case 'pomodoro':
      return 'Focus Time'
    case 'short_break':
      return 'Short Break'
    case 'long_break':
      return 'Long Break'
    default:
      return 'Focus Time'
  }
}

export const getDurationForSessionType = (sessionType: SessionType, settings?: any): number => {
  // Default values in seconds
  const defaults = {
    pomodoro: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60
  }
  
  if (settings?.timer) {
    switch (sessionType) {
      case 'pomodoro':
        return settings.timer.pomodoroTime * 60
      case 'short_break':
        return settings.timer.shortBreakTime * 60
      case 'long_break':
        return settings.timer.longBreakTime * 60
    }
  }
  
  return defaults[sessionType] || defaults.pomodoro
}