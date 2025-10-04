export interface TimerSettings {
  pomodoroTime: number // in minutes
  shortBreakTime: number // in minutes
  longBreakTime: number // in minutes
  longBreakInterval: number // number of pomodoros before long break
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

export interface AppearanceSettings {
  theme: 'light' | 'dark'
  accentColor: string
}

export interface SoundSettings {
  alarmSound: string
  backgroundSound: string
  alarmVolume: number // 0-1
  backgroundVolume: number // 0-1
}

export interface Settings {
  timer: TimerSettings
  appearance: AppearanceSettings
  sound: SoundSettings
}