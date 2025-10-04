'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react'
import { useTaskStore, useSessionStore, useSettingsStore } from '@/store'

interface DayData {
  date: string
  day: string
  focusMinutes: number
  completedTasks: number
  sessions: number
}

export const WeeklyChart: React.FC = () => {
  const { tasks } = useTaskStore()
  const { getWeekSessions } = useSessionStore()
  const { settings } = useSettingsStore()

  const weekData = useMemo(() => {
    const sessions = getWeekSessions()
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    
    const data: DayData[] = []
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart)
      currentDate.setDate(weekStart.getDate() + i)
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate.toDateString() === currentDate.toDateString()
      })
      
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime)
        return sessionDate.toDateString() === currentDate.toDateString()
      })
      
      const focusMinutes = daySessions
        .filter(session => session.type === 'pomodoro' && session.completed)
        .reduce((sum, session) => sum + session.durationMinutes, 0)
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        focusMinutes,
        completedTasks: dayTasks.filter(task => task.isCompleted).length,
        sessions: daySessions.length
      })
    }
    
    return data
  }, [tasks, getWeekSessions])

  const totalFocusTime = weekData.reduce((sum, day) => sum + day.focusMinutes, 0)
  const totalTasks = weekData.reduce((sum, day) => sum + day.completedTasks, 0)
  const totalSessions = weekData.reduce((sum, day) => sum + day.sessions, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">This Week</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">{Math.round(totalFocusTime / 60)}h</p>
          <p className="text-xs text-muted-foreground">Focus Time</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">{totalTasks}</p>
          <p className="text-xs text-muted-foreground">Tasks Done</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">{totalSessions}</p>
          <p className="text-xs text-muted-foreground">Sessions</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string) => [
                name === 'focusMinutes' ? `${Math.round(value / 60)}h ${value % 60}m` : value,
                name === 'focusMinutes' ? 'Focus Time' : 'Tasks'
              ]}
            />
            <Bar 
              dataKey="focusMinutes" 
              fill={settings.appearance.accentColor}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}