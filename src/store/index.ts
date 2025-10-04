import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimerState, SessionType, UserSettings, Task, Session } from '@/types'

// Default settings
const defaultSettings: UserSettings = {
  timer: {
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  },
  appearance: {
    theme: 'dark',
    accentColor: '#FF6347',
  },
  sound: {
    alarmSound: 'bell',
    backgroundSound: 'none',
    alarmVolume: 0.7,
    backgroundVolume: 0.3,
  },
}

// Timer Store
interface TimerStore {
  // Timer state
  timeLeft: number // in seconds
  sessionType: SessionType
  timerState: TimerState
  completedPomodoros: number
  
  // Actions
  setTimeLeft: (time: number) => void
  setSessionType: (type: SessionType) => void
  setTimerState: (state: TimerState) => void
  incrementPomodoros: () => void
  resetTimer: () => void
  skipSession: () => void
  
  // Getters
  getNextSessionType: () => SessionType
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timeLeft: defaultSettings.timer.pomodoroTime * 60,
  sessionType: 'pomodoro',
  timerState: 'idle',
  completedPomodoros: 0,
  
  setTimeLeft: (time) => set({ timeLeft: time }),
  setSessionType: (type) => set({ sessionType: type }),
  setTimerState: (state) => set({ timerState: state }),
  incrementPomodoros: () => set((state) => ({ completedPomodoros: state.completedPomodoros + 1 })),
  
  resetTimer: () => {
    const settings = useSettingsStore.getState().settings
    const { sessionType } = get()
    let newTime: number
    
    switch (sessionType) {
      case 'pomodoro':
        newTime = settings.timer.pomodoroTime * 60
        break
      case 'short_break':
        newTime = settings.timer.shortBreakTime * 60
        break
      case 'long_break':
        newTime = settings.timer.longBreakTime * 60
        break
    }
    
    set({ timeLeft: newTime, timerState: 'idle' })
  },
  
  skipSession: () => {
    const nextType = get().getNextSessionType()
    const settings = useSettingsStore.getState().settings
    let newTime: number
    
    switch (nextType) {
      case 'pomodoro':
        newTime = settings.timer.pomodoroTime * 60
        break
      case 'short_break':
        newTime = settings.timer.shortBreakTime * 60
        break
      case 'long_break':
        newTime = settings.timer.longBreakTime * 60
        break
    }
    
    set({ 
      sessionType: nextType, 
      timeLeft: newTime, 
      timerState: 'idle' 
    })
  },
  
  getNextSessionType: () => {
    const { sessionType, completedPomodoros } = get()
    const { longBreakInterval } = useSettingsStore.getState().settings.timer
    
    if (sessionType === 'pomodoro') {
      // After a pomodoro, check if it's time for a long break
      const nextCompletedCount = completedPomodoros + 1
      if (nextCompletedCount % longBreakInterval === 0) {
        return 'long_break'
      } else {
        return 'short_break'
      }
    } else {
      // After any break, return to pomodoro
      return 'pomodoro'
    }
  },
}))

// Settings Store
interface SettingsStore {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            timer: { ...state.settings.timer, ...newSettings.timer },
            appearance: { ...state.settings.appearance, ...newSettings.appearance },
            sound: { ...state.settings.sound, ...newSettings.sound },
          },
        })),
      
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'sisyphus-settings',
    }
  )
)

// Task Store
interface TaskStore {
  tasks: Task[]
  currentTask: Task | null
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, '_id' | 'createdAt'>) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  setCurrentTask: (task: Task | null) => void
  incrementTaskPomodoros: (taskId: string) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentTask: null,
      
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          _id: `temp_${Date.now()}`, // Temporary ID for local storage
          createdAt: new Date(),
        }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
      },
      
      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task._id === taskId ? { ...task, ...updates } : task
          ),
          currentTask: state.currentTask?._id === taskId 
            ? { ...state.currentTask, ...updates }
            : state.currentTask
        })),
      
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task._id !== taskId),
          currentTask: state.currentTask?._id === taskId ? null : state.currentTask
        })),
      
      setCurrentTask: (task) => set({ currentTask: task }),
      
      incrementTaskPomodoros: (taskId) => {
        const { updateTask } = get()
        const task = get().tasks.find(t => t._id === taskId)
        if (task) {
          updateTask(taskId, { actPomodoros: task.actPomodoros + 1 })
        }
      },
    }),
    {
      name: 'sisyphus-tasks',
    }
  )
)

// Session Store for analytics
interface SessionStore {
  sessions: Session[]
  
  addSession: (session: Omit<Session, '_id'>) => void
  getTodaySessions: () => Session[]
  getWeekSessions: () => Session[]
  getMonthSessions: () => Session[]
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      
      addSession: (sessionData) => {
        const newSession: Session = {
          ...sessionData,
          _id: `session_${Date.now()}`,
        }
        set((state) => ({ sessions: [...state.sessions, newSession] }))
      },
      
      getTodaySessions: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        return get().sessions.filter(session => {
          const sessionDate = new Date(session.startTime)
          return sessionDate >= today && sessionDate < tomorrow
        })
      },
      
      getWeekSessions: () => {
        const today = new Date()
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
        weekStart.setHours(0, 0, 0, 0)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        
        return get().sessions.filter(session => {
          const sessionDate = new Date(session.startTime)
          return sessionDate >= weekStart && sessionDate < weekEnd
        })
      },
      
      getMonthSessions: () => {
        const today = new Date()
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        
        return get().sessions.filter(session => {
          const sessionDate = new Date(session.startTime)
          return sessionDate >= monthStart && sessionDate < monthEnd
        })
      },
    }),
    {
      name: 'sisyphus-sessions',
    }
  )
)