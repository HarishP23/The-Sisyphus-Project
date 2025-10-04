'use client'

import { useMemo } from 'react'
import { Clock, CheckCircle, Target, Calendar } from 'lucide-react'
import { useTaskStore } from '@/store'

export const QuickStats: React.FC = () => {
  const { tasks, currentTask } = useTaskStore()

  const stats = useMemo(() => {
    const today = new Date()
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt)
      return taskDate.toDateString() === today.toDateString()
    })

    const completedToday = todayTasks.filter(task => task.isCompleted).length
    const totalActualPomodoros = todayTasks.reduce((sum, task) => sum + task.actPomodoros, 0)
    const focusTimeMinutes = totalActualPomodoros * 25
    const focusHours = Math.floor(focusTimeMinutes / 60)
    const focusMinutesRemainder = focusTimeMinutes % 60

    return {
      completedToday,
      totalActualPomodoros,
      focusTimeFormatted: `${focusHours}h ${focusMinutesRemainder}m`,
      currentTask: currentTask?.title || 'No task selected'
    }
  }, [tasks, currentTask])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Quick Stats</h2>
      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Focus Time Today</p>
          </div>
          <p className="text-lg font-semibold">{stats.focusTimeFormatted}</p>
        </div>

        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Completed Tasks</p>
          </div>
          <p className="text-lg font-semibold">{stats.completedToday}</p>
        </div>

        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Pomodoros Done</p>
          </div>
          <p className="text-lg font-semibold">{stats.totalActualPomodoros}</p>
        </div>

        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Current Task</p>
          </div>
          <p className="text-sm font-medium text-foreground truncate">
            {stats.currentTask}
          </p>
        </div>
      </div>
    </div>
  )
}