export interface Task {
  _id?: string
  userId?: string
  title: string
  notes?: string
  estPomodoros: number
  actPomodoros: number
  isCompleted: boolean
  createdAt: Date
}