// Timer types
export type TimerState = 'idle' | 'running' | 'paused'
export type SessionType = 'pomodoro' | 'short_break' | 'long_break'

export interface TimerSettings {
  pomodoroTime: number // in minutes
  shortBreakTime: number // in minutes
  longBreakTime: number // in minutes
  longBreakInterval: number // number of pomodoros before long break
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

// Theme and appearance types
export type ThemeMode = 'light' | 'dark'

export interface AppearanceSettings {
  theme: ThemeMode
  accentColor: string
}

// Sound types
export interface SoundSettings {
  alarmSound: string
  backgroundSound: string
  alarmVolume: number // 0-1
  backgroundVolume: number // 0-1
}

// Complete user settings
export interface UserSettings {
  timer: TimerSettings
  appearance: AppearanceSettings
  sound: SoundSettings
}

// Task types
export interface Task {
  _id?: string
  userId?: string
  title: string
  notes?: string
  estPomodoros: number
  actPomodoros: number
  isCompleted: boolean
  createdAt: Date
}

// Session tracking for analytics
export interface Session {
  _id?: string
  userId?: string
  taskId?: string
  type: SessionType
  startTime: Date
  endTime?: Date
  durationMinutes: number
  completed: boolean // whether the session was completed or skipped
}

// User type
export interface User {
  _id?: string
  name?: string
  email: string
  image?: string
  settings: UserSettings
  createdAt: Date
}

// Analytics data
export interface DayStats {
  date: string
  totalFocusMinutes: number
  completedPomodoros: number
  completedTasks: number
}

export interface WeekStats {
  weekStart: string
  days: DayStats[]
  totalFocusMinutes: number
  completedPomodoros: number
  completedTasks: number
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Component prop types
export interface TimerDisplayProps {
  timeLeft: number
  sessionType: SessionType
  isRunning: boolean
}

export interface TaskItemProps {
  task: Task
  isSelected: boolean
  onSelect: (task: Task) => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
}