'use client'

import { useMemo } from 'react'
import { Calendar, Award, Flame, Target } from 'lucide-react'
import { useTaskStore, useSessionStore } from '@/store'

export const ProductivityInsights: React.FC = () => {
  const { tasks } = useTaskStore()
  const { getTodaySessions, getWeekSessions, getMonthSessions } = useSessionStore()

  const insights = useMemo(() => {
    const todaySessions = getTodaySessions()
    const weekSessions = getWeekSessions()
    const monthSessions = getMonthSessions()

    // Calculate streaks
    const today = new Date()
    let currentStreak = 0
    let checkDate = new Date(today)
    
    while (true) {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate.toDateString() === checkDate.toDateString() && task.isCompleted
      })
      
      if (dayTasks.length > 0) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Focus time calculations
    const todayFocusMinutes = todaySessions
      .filter(s => s.type === 'pomodoro' && s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0)
    
    const weekFocusMinutes = weekSessions
      .filter(s => s.type === 'pomodoro' && s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0)

    // Best day this week
    const weekDays = new Map<string, number>()
    weekSessions.forEach(session => {
      if (session.type === 'pomodoro' && session.completed) {
        const day = new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'long' })
        weekDays.set(day, (weekDays.get(day) || 0) + session.durationMinutes)
      }
    })
    
    const bestDay = Array.from(weekDays.entries())
      .sort(([,a], [,b]) => b - a)[0]

    return {
      currentStreak,
      todayFocusTime: todayFocusMinutes,
      weekFocusTime: weekFocusMinutes,
      bestDay: bestDay ? bestDay[0] : 'No data',
      bestDayTime: bestDay ? bestDay[1] : 0,
      todayTasksCompleted: tasks.filter(t => {
        const taskDate = new Date(t.createdAt)
        return taskDate.toDateString() === today.toDateString() && t.isCompleted
      }).length
    }
  }, [tasks, getTodaySessions, getWeekSessions, getMonthSessions])

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Award className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Insights</h3>
      </div>

      <div className="space-y-3">
        {/* Current Streak */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-semibold">{insights.currentStreak} Day Streak</p>
              <p className="text-sm text-muted-foreground">
                {insights.currentStreak > 0 ? 'Keep it up!' : 'Start your streak today!'}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Focus */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold">
                {Math.floor(insights.todayFocusTime / 60)}h {insights.todayFocusTime % 60}m Today
              </p>
              <p className="text-sm text-muted-foreground">
                {insights.todayTasksCompleted} tasks completed
              </p>
            </div>
          </div>
        </div>

        {/* Best Day */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold">Best Day: {insights.bestDay}</p>
              <p className="text-sm text-muted-foreground">
                {Math.floor(insights.bestDayTime / 60)}h {insights.bestDayTime % 60}m focused
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">This Week</p>
              <p className="text-sm text-muted-foreground">
                {Math.floor(insights.weekFocusTime / 60)}h total focus time
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {Math.round((insights.weekFocusTime / (7 * 60)) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Daily avg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}