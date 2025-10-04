'use client'

import { useState } from 'react'
import { Check, Edit3, Trash2, Play, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useTaskStore } from '@/store'
import { Task } from '@/types'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  isSelected: boolean
  onSelect: (task: Task) => void
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, isSelected, onSelect }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editNotes, setEditNotes] = useState(task.notes || '')
  const [editEstPomodoros, setEditEstPomodoros] = useState(task.estPomodoros)

  const { updateTask, deleteTask } = useTaskStore()

  const handleToggleComplete = () => {
    updateTask(task._id!, { isCompleted: !task.isCompleted })
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditTitle(task.title)
    setEditNotes(task.notes || '')
    setEditEstPomodoros(task.estPomodoros)
  }

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return

    updateTask(task._id!, {
      title: editTitle.trim(),
      notes: editNotes.trim() || undefined,
      estPomodoros: editEstPomodoros,
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(task.title)
    setEditNotes(task.notes || '')
    setEditEstPomodoros(task.estPomodoros)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task._id!)
    }
  }

  const handleSelect = () => {
    if (!task.isCompleted) {
      onSelect(task)
    }
  }

  const progressPercentage = task.estPomodoros > 0 
    ? Math.min((task.actPomodoros / task.estPomodoros) * 100, 100)
    : 0

  if (isEditing) {
    return (
      <motion.div
        layout
        className="bg-card border border-border rounded-lg p-4 space-y-3"
      >
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
        />
        <Textarea
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
        />
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Estimated Pomodoros:</label>
          <Input
            type="number"
            min="1"
            max="20"
            value={editEstPomodoros}
            onChange={(e) => setEditEstPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveEdit} disabled={!editTitle.trim()}>
            Save
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      className={cn(
        "bg-card border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md",
        isSelected && !task.isCompleted && "border-primary bg-primary/5 shadow-md",
        task.isCompleted && "opacity-60"
      )}
      onClick={handleSelect}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleToggleComplete()
          }}
          className={cn(
            "mt-1 flex items-center justify-center w-5 h-5 rounded border-2 transition-colors",
            task.isCompleted
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground hover:border-primary"
          )}
        >
          {task.isCompleted && <Check className="w-3 h-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-medium text-sm",
                task.isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h4>
              {task.notes && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {task.notes}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1 ml-2">
              {isSelected && !task.isCompleted && (
                <div className="flex items-center text-xs text-primary font-medium mr-2">
                  <Play className="w-3 h-3 mr-1" />
                  Active
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit()
                }}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Progress bar and stats */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{task.actPomodoros} / {task.estPomodoros} pomodoros</span>
              </div>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1.5">
              <motion.div
                className="bg-primary h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}