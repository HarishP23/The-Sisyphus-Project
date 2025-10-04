'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FlipClock } from '@/components/FlipClock'
import { useTimerStore, useSettingsStore, useTaskStore, useSessionStore } from '@/store'
import { formatTimeForTitle, minutesToSeconds, getSessionTypeColor, getSessionTypeDisplay, getDurationForSessionType } from '@/lib/utils'
import { SessionType } from '@/types'
import { useTimerSync } from '@/hooks/useTimerSync'

export const Timer: React.FC = () => {
  const { 
    timeLeft, 
    sessionType, 
    timerState, 
    completedPomodoros,
    setTimeLeft, 
    setTimerState, 
    incrementPomodoros,
    resetTimer,
    skipSession,
    getNextSessionType,
    setSessionType
  } = useTimerStore()
  
  const { settings } = useTimerSync()
  const { currentTask, incrementTaskPomodoros } = useTaskStore()
  const { addSession } = useSessionStore()
  
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update document title
  useEffect(() => {
    const sessionTypeText = {
      pomodoro: 'Time to focus!',
      short_break: 'Short break',
      long_break: 'Long break'
    }
    
    if (timerState === 'running') {
      document.title = `${formatTimeForTitle(timeLeft)} - ${sessionTypeText[sessionType]}`
    } else {
      document.title = 'Sisyphus Timer - Pomodoro Focus App'
    }
    
    return () => {
      document.title = 'Sisyphus Timer - Pomodoro Focus App'
    }
  }, [timeLeft, sessionType, timerState])

  // Timer countdown logic
  useEffect(() => {
    if (timerState === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, timeLeft, setTimeLeft])

  // Handle session completion
  useEffect(() => {
    if (timeLeft === 0 && timerState === 'running') {
      handleSessionComplete()
    }
  }, [timeLeft, timerState])

  const handleSessionComplete = () => {
    // Record the session
    if (sessionStartTime) {
      addSession({
        type: sessionType,
        startTime: sessionStartTime,
        endTime: new Date(),
        durationMinutes: getDurationForSessionType(sessionType, settings) / 60,
        completed: true,
        taskId: currentTask?._id
      })
    }

    // Update pomodoro count and task progress
    if (sessionType === 'pomodoro') {
      incrementPomodoros()
      if (currentTask) {
        incrementTaskPomodoros(currentTask._id!)
      }
    }

    // Move to next session
    const nextType = getNextSessionType()
    handleSessionTransition(nextType)
  }

  const handleSessionTransition = (nextType: SessionType) => {
    setSessionType(nextType)
    
    const newTime = getDurationForSessionType(nextType, settings)
    setTimeLeft(newTime)
    
    // Auto-start logic
    const shouldAutoStart = 
      (nextType === 'pomodoro' && settings.timer.autoStartPomodoros) ||
      (nextType !== 'pomodoro' && settings.timer.autoStartBreaks)
    
    if (shouldAutoStart) {
      setTimerState('running')
      setSessionStartTime(new Date())
    } else {
      setTimerState('idle')
      setSessionStartTime(null)
    }
  }

  const handleStartPause = () => {
    if (timerState === 'running') {
      setTimerState('paused')
    } else {
      setTimerState('running')
      if (!sessionStartTime) {
        setSessionStartTime(new Date())
      }
    }
  }

  const handleReset = () => {
    if (sessionStartTime && timerState !== 'idle') {
      // Record incomplete session
      addSession({
        type: sessionType,
        startTime: sessionStartTime,
        endTime: new Date(),
        durationMinutes: getDurationForSessionType(sessionType, settings) / 60,
        completed: false,
        taskId: currentTask?._id
      })
    }
    
    resetTimer()
    setSessionStartTime(null)
  }

  const handleSkip = () => {
    if (sessionStartTime && timerState !== 'idle') {
      // Record skipped session
      addSession({
        type: sessionType,
        startTime: sessionStartTime,
        endTime: new Date(),
        durationMinutes: getDurationForSessionType(sessionType, settings) / 60,
        completed: false,
        taskId: currentTask?._id
      })
    }
    
    const nextType = getNextSessionType()
    handleSessionTransition(nextType)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Session Type Header with Gradient Badge */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="inline-block"
        >
          <div
            className="inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${getSessionTypeColor(sessionType).color}15, ${getSessionTypeColor(sessionType).color}30)`,
              color: getSessionTypeColor(sessionType).color,
              border: `2px solid ${getSessionTypeColor(sessionType).color}40`,
            }}
          >
            <span className="relative flex h-2 w-2 mr-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: getSessionTypeColor(sessionType).color }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: getSessionTypeColor(sessionType).color }}
              ></span>
            </span>
            {getSessionTypeDisplay(sessionType)}
          </div>
        </motion.div>

        <h2 className="text-xl font-medium text-muted-foreground">
          Session <span className="font-bold text-foreground">#{completedPomodoros + 1}</span>
        </h2>
      </div>

      {/* Current Task Display - Enhanced Card */}
      {currentTask && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-br from-card to-card/50 border-2 border-border rounded-2xl p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Currently Working On
              </p>
              <div className="flex items-center space-x-1">
                {[...Array(currentTask.estPomodoros)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i < currentTask.actPomodoros ? "bg-primary scale-110" : "bg-muted"
                    }`}
                    style={i < currentTask.actPomodoros ? { backgroundColor: getSessionTypeColor(sessionType).color } : {}}
                  />
                ))}
              </div>
            </div>

            <p className="font-bold text-foreground text-xl leading-tight">{currentTask.title}</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{currentTask.actPomodoros}</span> of{" "}
                <span className="font-semibold text-foreground">{currentTask.estPomodoros}</span> pomodoros completed
              </span>
              <span
                className="font-semibold px-3 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: `${getSessionTypeColor(sessionType).color}15`,
                  color: getSessionTypeColor(sessionType).color,
                }}
              >
                {Math.round((currentTask.actPomodoros / currentTask.estPomodoros) * 100)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timer Display with Glow Effect */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative flex justify-center py-8"
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 blur-3xl opacity-20 rounded-full"
          style={{
            background: `radial-gradient(circle, ${getSessionTypeColor(sessionType).color} 0%, transparent 70%)`,
          }}
        />

        {/* Progress ring */}
        <div className="relative">
          <svg className="absolute inset-0 -rotate-90" width="100%" height="100%" viewBox="0 0 400 400">
            <circle
              cx="200"
              cy="200"
              r="190"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            <circle
              cx="200"
              cy="200"
              r="190"
              fill="none"
              stroke={getSessionTypeColor(sessionType).color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 190}`}
              strokeDashoffset={`${2 * Math.PI * 190 * (1 - timeLeft / getDurationForSessionType(sessionType, settings))}`}
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: `drop-shadow(0 0 8px ${getSessionTypeColor(sessionType).color}40)`,
              }}
            />
          </svg>

          <FlipClock timeLeft={timeLeft} isRunning={timerState === "running"} />
        </div>
      </motion.div>

      {/* Timer Controls - Enhanced Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-4 flex-wrap"
      >
        <Button
          onClick={handleStartPause}
          size="lg"
          className="relative group overflow-hidden px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${getSessionTypeColor(sessionType).color}, ${getSessionTypeColor(sessionType).color}dd)`,
            color: "white",
          }}
        >
          <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          <span className="relative flex items-center">
            {timerState === "running" ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </span>
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="px-6 py-6 border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-semibold bg-transparent"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>

        <Button
          onClick={handleSkip}
          variant="outline"
          size="lg"
          className="px-6 py-6 border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-semibold bg-transparent"
        >
          <SkipForward className="w-5 h-5 mr-2" />
          Skip
        </Button>
      </motion.div>

      {/* Session Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center space-x-2 pt-4"
      >
        {[...Array(settings.timer.longBreakInterval)].map((_, i) => (
          <div
            key={i}
            className={`h-3 rounded-full transition-all duration-300 ${
              i < completedPomodoros % settings.timer.longBreakInterval ? "w-12 shadow-lg" : "w-3"
            }`}
            style={{
              backgroundColor:
                i < completedPomodoros % settings.timer.longBreakInterval
                  ? getSessionTypeColor(sessionType).color
                  : "rgb(229 231 235)",
              boxShadow:
                i < completedPomodoros % settings.timer.longBreakInterval
                  ? `0 4px 12px ${getSessionTypeColor(sessionType).color}40`
                  : "none",
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

export default Timer
