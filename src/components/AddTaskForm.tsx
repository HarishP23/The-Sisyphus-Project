'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useTaskStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'

export const AddTaskForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [estPomodoros, setEstPomodoros] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { addTask } = useTaskStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      addTask({
        title: title.trim(),
        notes: notes.trim() || undefined,
        estPomodoros,
        actPomodoros: 0,
        isCompleted: false,
      })

      // Reset form
      setTitle('')
      setNotes('')
      setEstPomodoros(1)
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setNotes('')
    setEstPomodoros(1)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full justify-start"
        variant="outline"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Task
      </Button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-lg p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add New Task</h3>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title *</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to work on?"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes (optional)</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-estimate">Estimated Pomodoros</Label>
            <Input
              id="task-estimate"
              type="number"
              min="1"
              max="20"
              value={estPomodoros}
              onChange={(e) => setEstPomodoros(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24"
            />
            <p className="text-xs text-muted-foreground">
              How many 25-minute sessions do you think this will take?
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  )
}