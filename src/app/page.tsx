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
  const { tasks } = useTaskStore()
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
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl floating" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl floating" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl floating" style={{ animationDelay: '-1.5s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-6 glass-card mx-4 mt-4 rounded-3xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-white/90 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Pomodoro Timer
              </h1>
              <p className="text-white/80 font-medium">{greeting}! Ready to focus?</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="flex items-center space-x-4 text-sm">
                <div className="glass-card px-4 py-2 rounded-2xl">
                  <p className="text-white/90 font-medium">
                    <span className="text-2xl font-bold text-white">{completedToday}</span>
                    <span className="text-white/70 ml-1">tasks done</span>
                  </p>
                </div>
                <div className="glass-card px-4 py-2 rounded-2xl">
                  <p className="text-white/90 font-medium">
                    <span className="text-2xl font-bold text-white">{totalActualPomodoros}</span>
                    <span className="text-white/70 ml-1">/ {totalEstimatedPomodoros} pomodoros</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon" asChild className="glass-card border-white/20 hover:bg-white/10 transition-all duration-300">
                <a href="/reports">
                  <BarChart3 className="w-5 h-5 text-white" />
                </a>
              </Button>
              <SettingsDialog />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex h-[calc(100vh-120px)] mt-6">
        {/* Left Sidebar - Tasks */}
        <aside className="w-80 mx-4 glass-card rounded-3xl p-6 hidden lg:block overflow-y-auto">
          <TaskList />
        </aside>

        {/* Main Timer Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl text-center">
            <Timer />
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <aside className="w-72 mx-4 glass-card rounded-3xl p-6 hidden xl:block overflow-y-auto">
          <QuickStats />
        </aside>
      </div>

      {/* Mobile Task List */}
      <div className="lg:hidden mx-4 mb-4 glass-card rounded-3xl p-6">
        <TaskList />
      </div>
    </main>
  )
}
