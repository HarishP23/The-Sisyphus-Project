'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTime } from '@/lib/utils'

interface FlipClockProps {
  timeLeft: number // in seconds
  isRunning: boolean
}

interface FlipDigitProps {
  digit: string
  prevDigit: string
  isFlipping: boolean
}

const FlipDigit: React.FC<FlipDigitProps> = ({ digit, prevDigit, isFlipping }) => {
  return (
    <div className="relative w-20 h-24 md:w-24 md:h-28 lg:w-28 lg:h-32">
      <motion.div 
        className="timer-digit w-full h-full flex items-center justify-center text-3xl md:text-4xl lg:text-5xl font-bold transition-all duration-500 bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-600 shadow-2xl"
        animate={{
          scale: isFlipping ? [1, 0.95, 1] : 1,
          rotateX: isFlipping ? [0, -10, 0] : 0
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <span className="text-white drop-shadow-lg font-mono tracking-wider">
          {isFlipping ? digit : prevDigit}
        </span>
        {/* Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-xl pointer-events-none" />
      </motion.div>
    </div>
  )
}

const ColonSeparator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-24 md:h-28 lg:h-32 mx-3">
      <motion.div 
        className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mb-3 shadow-lg"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full shadow-lg"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </div>
  )
}

export const FlipClock: React.FC<FlipClockProps> = ({ timeLeft, isRunning }) => {
  const [displayTime, setDisplayTime] = useState(formatTime(timeLeft))
  const [prevTime, setPrevTime] = useState(formatTime(timeLeft))
  const [flippingIndices, setFlippingIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    const newTime = formatTime(timeLeft)
    const prevTimeStr = displayTime
    
    // Find which digits are changing
    const newFlipping = new Set<number>()
    for (let i = 0; i < newTime.length; i++) {
      if (newTime[i] !== prevTimeStr[i] && newTime[i] !== ':') {
        newFlipping.add(i)
      }
    }
    
    if (newFlipping.size > 0) {
      setPrevTime(prevTimeStr)
      setFlippingIndices(newFlipping)
      
      // After flip animation, update display time
      setTimeout(() => {
        setDisplayTime(newTime)
        setFlippingIndices(new Set())
      }, 300)
    } else {
      setDisplayTime(newTime)
    }
  }, [timeLeft])

  const timeDigits = displayTime.split('')
  const prevTimeDigits = prevTime.split('')

  return (
    <motion.div 
      className="relative flex items-center justify-center space-x-2 select-none"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-full" />
      
      {/* Timer digits */}
      <div className="relative z-10 flex items-center space-x-1">
        {timeDigits.map((digit, index) => (
          <motion.div 
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            {digit === ':' ? (
              <ColonSeparator />
            ) : (
              <FlipDigit
                digit={digit}
                prevDigit={prevTimeDigits[index] || digit}
                isFlipping={flippingIndices.has(index)}
              />
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Pulse effect when running */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-400/30 rounded-2xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  )
}