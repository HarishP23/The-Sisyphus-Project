'use client'

import { useEffect, useMemo } from 'react'
import { Calendar, CheckCircle, Clock, Target } from 'lucide-react'
import { AddTaskForm } from '@/components/AddTaskForm'
import { TaskItem } from '@/components/TaskItem'
import { useTaskStore } from '@/store'
import { Task } from '@/types'
import { calculateFinishTime } from '@/lib/utils'
import { useSettingsStore } from '@/store'

export const TaskList: React.FC = () => {
  const { tasks, currentTask, setCurrentTask } = useTaskStore()
  const { settings } = useSettingsStore()

  // Filter tasks for today
  const todayTasks = useMemo(() => {
    const today = new Date()
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt)
      return taskDate.toDateString() === today.toDateString()
    })
  }, [tasks])

  // Separate completed and incomplete tasks
  const incompleteTasks = useMemo(() => 
    todayTasks.filter(task => !task.isCompleted), [todayTasks]
  )
  
  const completedTasks = useMemo(() => 
    todayTasks.filter(task => task.isCompleted), [todayTasks]
  )

  // Calculate stats
  const stats = useMemo(() => {
    const totalEstimated = incompleteTasks.reduce((sum, task) => sum + task.estPomodoros, 0)
    const totalActual = todayTasks.reduce((sum, task) => sum + task.actPomodoros, 0)
    const completedCount = completedTasks.length
    
    const finishTime = totalEstimated > 0 ? calculateFinishTime(
      incompleteTasks,
      settings.timer.pomodoroTime,
      settings.timer.shortBreakTime,
      settings.timer.longBreakTime,
      settings.timer.longBreakInterval
    ) : null

    return {
      totalEstimated,
      totalActual,
      completedCount,
      finishTime
    }
  }, [incompleteTasks, completedTasks, todayTasks, settings])

  // Auto-select first incomplete task if none selected
  useEffect(() => {
    if (!currentTask && incompleteTasks.length > 0) {
      setCurrentTask(incompleteTasks[0])
    }
  }, [currentTask, incompleteTasks, setCurrentTask])

  const handleSelectTask = (task: Task) => {
    setCurrentTask(task)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            Today's Tasks
          </h2>
        </div>
        
        {/* Stats Summary */}
        {todayTasks.length > 0 && (
          <div className="bg-muted rounded-lg p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-muted-foreground">
                {stats.totalActual} / {stats.totalEstimated} pomodoros
              </div>
              <div className="text-muted-foreground">
                {stats.completedCount} completed
              </div>
              {stats.finishTime && (
                <div className="col-span-2 text-muted-foreground">
                  Est. finish: {stats.finishTime.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Form */}
      <AddTaskForm />

      {/* Task Lists */}
      <div className="space-y-4">
        {/* Incomplete Tasks */}
        {incompleteTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              To Do ({incompleteTasks.length})
            </h3>
            <div className="space-y-2">
              {incompleteTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  isSelected={currentTask?._id === task._id}
                  onSelect={handleSelectTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  isSelected={false}
                  onSelect={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todayTasks.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">No tasks for today</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Add your first task to start using the Pomodoro technique!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}