'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { motion } from 'framer-motion'
// import { Button } from '@/components/ui/button'
import { FlipClock } from '@/components/FlipClock'
import { useTimerStore, useTaskStore, useSessionStore } from '@/store'
import { formatTimeForTitle, getSessionTypeColor, getSessionTypeDisplay, getDurationForSessionType } from '@/lib/utils'
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
    // skipSession,
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
    // Add a brief pause for smooth transition
    setTimerState('idle')
    
    setTimeout(() => {
      setSessionType(nextType)
      
      const newTime = getDurationForSessionType(nextType, settings)
      setTimeLeft(newTime)
      
      // Auto-start logic
      const shouldAutoStart = 
        (nextType === 'pomodoro' && settings.timer.autoStartPomodoros) ||
        (nextType !== 'pomodoro' && settings.timer.autoStartBreaks)
      
      if (shouldAutoStart) {
        setTimeout(() => {
          setTimerState('running')
          setSessionStartTime(new Date())
        }, 300) // Small delay for smooth transition
      } else {
        setTimerState('idle')
        setSessionStartTime(null)
      }
    }, 150) // Brief pause for visual transition
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Session Type Header with Modern Badge */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-block"
        >
          <div
            className="session-badge inline-flex items-center px-8 py-4 text-lg font-bold tracking-wide shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${getSessionTypeColor(sessionType).color}20, ${getSessionTypeColor(sessionType).color}40)`,
              color: 'white',
              border: `2px solid ${getSessionTypeColor(sessionType).color}60`,
              boxShadow: `0 8px 32px ${getSessionTypeColor(sessionType).color}30, 0 0 0 1px rgba(255,255,255,0.1) inset`,
            }}
          >
            <motion.div
              className="relative flex h-3 w-3 mr-3"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: getSessionTypeColor(sessionType).color }}
              />
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ backgroundColor: getSessionTypeColor(sessionType).color }}
              />
            </motion.div>
            {getSessionTypeDisplay(sessionType)}
          </div>
        </motion.div>

        <motion.h2 
          className="text-2xl font-bold text-white/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Session <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">#{completedPomodoros + 1}</span>
        </motion.h2>
      </div>

      {/* Current Task Display - Modern Glass Card */}
      {currentTask && (
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="relative glass-card p-8 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <motion.p 
                className="text-sm uppercase tracking-widest text-white/70 font-bold"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Currently Working On
              </motion.p>
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[...Array(currentTask.estPomodoros)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`progress-dot ${i < currentTask.actPomodoros ? 'active' : ''}`}
                    style={{ 
                      backgroundColor: i < currentTask.actPomodoros 
                        ? getSessionTypeColor(sessionType).color 
                        : 'rgba(255,255,255,0.3)' 
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                  />
                ))}
              </motion.div>
            </div>

            <motion.h3 
              className="font-bold text-white text-2xl leading-tight"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {currentTask.title}
            </motion.h3>

            <motion.div 
              className="flex items-center justify-between"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <span className="text-white/80 text-lg">
                <span className="font-bold text-white text-xl">{currentTask.actPomodoros}</span> of{" "}
                <span className="font-bold text-white text-xl">{currentTask.estPomodoros}</span> pomodoros completed
              </span>
              <div
                className="font-bold px-4 py-2 rounded-2xl text-lg glass-card"
                style={{
                  backgroundColor: `${getSessionTypeColor(sessionType).color}20`,
                  color: getSessionTypeColor(sessionType).color,
                  border: `1px solid ${getSessionTypeColor(sessionType).color}40`,
                }}
              >
                {Math.round((currentTask.actPomodoros / currentTask.estPomodoros) * 100)}%
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Timer Display with Enhanced Effects */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 1, ease: "easeOut" }}
        className="relative flex justify-center py-12"
      >
        {/* Multiple glow layers for depth */}
        <div
          className="absolute inset-0 blur-3xl opacity-30 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${getSessionTypeColor(sessionType).color} 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute inset-0 blur-2xl opacity-20 rounded-full"
          style={{
            background: `radial-gradient(circle, ${getSessionTypeColor(sessionType).color} 0%, transparent 80%)`,
          }}
        />

        {/* Enhanced Progress Ring */}
        <div className="relative">
          <svg className="absolute inset-0 -rotate-90 drop-shadow-2xl" width="100%" height="100%" viewBox="0 0 480 480">
            {/* Background ring */}
            <circle
              cx="240"
              cy="240"
              r="220"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              className="drop-shadow-lg"
            />
            {/* Progress ring */}
            <motion.circle
              cx="240"
              cy="240"
              r="220"
              fill="none"
              stroke={getSessionTypeColor(sessionType).color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 220}`}
              strokeDashoffset={`${2 * Math.PI * 220 * (1 - timeLeft / getDurationForSessionType(sessionType, settings))}`}
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: `drop-shadow(0 0 20px ${getSessionTypeColor(sessionType).color}) drop-shadow(0 0 40px ${getSessionTypeColor(sessionType).color}40)`,
              }}
              animate={{
                filter: timerState === 'running' 
                  ? `drop-shadow(0 0 25px ${getSessionTypeColor(sessionType).color}) drop-shadow(0 0 50px ${getSessionTypeColor(sessionType).color}60)`
                  : `drop-shadow(0 0 15px ${getSessionTypeColor(sessionType).color}) drop-shadow(0 0 30px ${getSessionTypeColor(sessionType).color}30)`
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
            {/* Inner decorative ring */}
            <circle
              cx="240"
              cy="240"
              r="200"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="2"
            />
          </svg>

          {/* Timer Clock in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FlipClock timeLeft={timeLeft} isRunning={timerState === "running"} />
          </div>
        </div>
      </motion.div>

      {/* Timer Controls - Modern Button Design */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="flex items-center justify-center gap-6 flex-wrap"
      >
        <motion.button
          onClick={handleStartPause}
          className="btn-gradient relative group overflow-hidden px-12 py-6 text-xl font-bold shadow-2xl transition-all duration-500 hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${getSessionTypeColor(sessionType).color}, ${getSessionTypeColor(sessionType).color}cc)`,
            borderRadius: '24px',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
          <motion.span 
            className="relative flex items-center text-white"
            initial={false}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              initial={false}
              animate={{ rotate: timerState === "running" ? 0 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {timerState === "running" ? (
                <Pause className="w-6 h-6 mr-3" />
              ) : (
                <Play className="w-6 h-6 mr-3" />
              )}
            </motion.div>
            {timerState === "running" ? "Pause" : "Start"}
          </motion.span>
        </motion.button>

        <motion.button
          onClick={handleReset}
          className="glass-card px-8 py-6 border-2 border-white/20 hover:bg-white/10 transition-all duration-500 hover:scale-105 shadow-xl font-bold text-white text-lg rounded-2xl group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center">
            <motion.div
              whileHover={{ rotate: -180 }}
              transition={{ duration: 0.5 }}
            >
              <RotateCcw className="w-6 h-6 mr-3" />
            </motion.div>
            Reset
          </span>
        </motion.button>

        <motion.button
          onClick={handleSkip}
          className="glass-card px-8 py-6 border-2 border-white/20 hover:bg-white/10 transition-all duration-500 hover:scale-105 shadow-xl font-bold text-white text-lg rounded-2xl group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center">
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ duration: 0.3 }}
            >
              <SkipForward className="w-6 h-6 mr-3" />
            </motion.div>
            Skip
          </span>
        </motion.button>
      </motion.div>

      {/* Session Progress Indicator - Modern Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="flex items-center justify-center space-x-3 pt-8"
      >
        <motion.p 
          className="text-white/60 text-sm font-medium mr-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          Session Progress
        </motion.p>
        {[...Array(settings.timer.longBreakInterval)].map((_, i) => (
          <motion.div
            key={i}
            className={`progress-dot ${i < completedPomodoros % settings.timer.longBreakInterval ? 'active' : ''}`}
            style={{
              backgroundColor: i < completedPomodoros % settings.timer.longBreakInterval
                ? getSessionTypeColor(sessionType).color
                : "rgba(255,255,255,0.2)",
              boxShadow: i < completedPomodoros % settings.timer.longBreakInterval
                ? `0 4px 20px ${getSessionTypeColor(sessionType).color}60, 0 0 0 2px ${getSessionTypeColor(sessionType).color}40`
                : "none",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 1.6 + i * 0.1, 
              type: "spring", 
              stiffness: 300,
              damping: 20 
            }}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </motion.div>
    </div>
  )
}

export default Timer
