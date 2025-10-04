'use client'

import { useState } from 'react'
import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WeeklyChart } from '@/components/WeeklyChart'
import { ProductivityInsights } from '@/components/ProductivityInsights'
import { useTaskStore, useSessionStore } from '@/store'

export const ReportsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview')
  const { tasks } = useTaskStore()
  const { sessions } = useSessionStore()

  const exportData = () => {
    // Create CSV data
    const csvData = [
      ['Date', 'Task Title', 'Estimated Pomodoros', 'Actual Pomodoros', 'Completed', 'Notes'],
      ...tasks.map(task => [
        new Date(task.createdAt).toLocaleDateString(),
        task.title,
        task.estPomodoros.toString(),
        task.actPomodoros.toString(),
        task.isCompleted ? 'Yes' : 'No',
        task.notes || ''
      ])
    ]

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `sisyphus-timer-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-2 inline" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'detailed'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2 inline" />
          Detailed
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <WeeklyChart />
          </div>
          <div className="space-y-6">
            <ProductivityInsights />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Detailed View */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Session History</h3>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No session data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start using the timer to see your session history here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 10).map((session, index) => (
                  <div key={session._id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="font-medium capitalize">{session.type.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.startTime).toLocaleDateString()} at{' '}
                        {new Date(session.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{session.durationMinutes}m</p>
                      <p className={`text-sm ${
                        session.completed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {session.completed ? 'Completed' : 'Skipped'}
                      </p>
                    </div>
                  </div>
                ))}
                {sessions.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Showing last 10 sessions. Export data to see full history.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}