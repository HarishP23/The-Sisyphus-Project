'use client'

import { Timer } from '@/components/Timer'
import { TaskList } from '@/components/TaskList'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuickStats } from '@/components/QuickStats'
import { SettingsDialog } from '@/components/SettingsDialog'
import { getGreeting } from '@/lib/utils'
import { useTaskStore } from '@/store'

export default function Home() {
  const { tasks, currentTask } = useTaskStore()
  const greeting = getGreeting()
  
  const todayTasks = tasks.filter(task => {
    const today = new Date()
    const taskDate = new Date(task.createdAt)
    return taskDate.toDateString() === today.toDateString()
  })
  
  const completedToday = todayTasks.filter(task => task.isCompleted).length
  const totalEstimatedPomodoros = todayTasks.reduce((sum, task) => 
    task.isCompleted ? sum : sum + task.estPomodoros, 0
  )
  const totalActualPomodoros = todayTasks.reduce((sum, task) => sum + task.actPomodoros, 0)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full p-4 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sisyphus Timer</h1>
            <p className="text-muted-foreground">{greeting}! Ready to focus?</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <p className="text-muted-foreground">
                Today: <span className="font-medium text-foreground">{completedToday}</span> tasks completed
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{totalActualPomodoros}</span> / {totalEstimatedPomodoros} pomodoros
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" asChild>
                <a href="/reports">
                  <BarChart3 className="w-4 h-4" />
                </a>
              </Button>
              <SettingsDialog />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Tasks */}
        <aside className="w-80 border-r border-border bg-card p-6 hidden lg:block h-[calc(100vh-80px)] overflow-y-auto">
          <TaskList />
        </aside>

        {/* Main Timer Area */}
        <div className="flex-1 flex items-center justify-center p-8 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-2xl text-center">
            <Timer />
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <aside className="w-64 border-l border-border bg-card p-6 hidden xl:block h-[calc(100vh-80px)] overflow-y-auto">
          <QuickStats />
        </aside>
      </div>

      {/* Mobile Task List */}
      <div className="lg:hidden border-t border-border bg-card p-4">
        <TaskList />
      </div>
    </main>
  )
}
