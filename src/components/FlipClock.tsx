'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    <div className="relative w-24 h-32 md:w-28 md:h-36 lg:w-32 lg:h-40">
      <motion.div 
        className="timer-digit w-full h-full flex items-center justify-center text-4xl md:text-5xl lg:text-6xl font-bold transition-all duration-700 shadow-2xl"
        animate={{
          scale: isFlipping ? [1, 0.98, 1.02, 1] : 1,
          rotateX: isFlipping ? [0, -15, 15, 0] : 0,
          y: isFlipping ? [0, -2, 2, 0] : 0
        }}
        transition={{ 
          duration: 0.8, 
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.3, 0.7, 1]
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.span 
          className="relative font-mono tracking-tight drop-shadow-2xl"
          animate={{
            textShadow: isFlipping 
              ? ["0 2px 4px rgba(0,0,0,0.3)", "0 4px 8px rgba(0,0,0,0.5)", "0 2px 4px rgba(0,0,0,0.3)"]
              : "0 2px 4px rgba(0,0,0,0.3)"
          }}
          transition={{ duration: 0.8 }}
        >
          {isFlipping ? digit : prevDigit}
        </motion.span>
        
        {/* Enhanced shine overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-2xl pointer-events-none"
          animate={{
            opacity: isFlipping ? [0.2, 0.6, 0.2] : 0.2
          }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Glow effect when flipping */}
        {isFlipping && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              boxShadow: [
                "0 0 0px rgba(255,255,255,0)",
                "0 0 20px rgba(255,255,255,0.3)",
                "0 0 0px rgba(255,255,255,0)"
              ]
            }}
            transition={{ duration: 0.8 }}
          />
        )}
      </motion.div>
    </div>
  )
}

const ColonSeparator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-32 md:h-36 lg:h-40 mx-4">
      <motion.div 
        className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-white to-white/80 rounded-full mb-4 shadow-2xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8],
          boxShadow: [
            "0 4px 12px rgba(255,255,255,0.3)",
            "0 6px 20px rgba(255,255,255,0.6)",
            "0 4px 12px rgba(255,255,255,0.3)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-white to-white/80 rounded-full shadow-2xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8],
          boxShadow: [
            "0 4px 12px rgba(255,255,255,0.3)",
            "0 6px 20px rgba(255,255,255,0.6)",
            "0 4px 12px rgba(255,255,255,0.3)"
          ]
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
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Enhanced background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 blur-3xl rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-400/20 to-pink-400/20 blur-2xl rounded-full animate-pulse" />
      
      {/* Timer digits container */}
      <div className="relative z-10 flex items-center space-x-2 p-6 glass-card rounded-3xl">
        {timeDigits.map((digit, index) => (
          <motion.div 
            key={index}
            initial={{ y: 30, opacity: 0, rotateX: -90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            transition={{ 
              delay: index * 0.15, 
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1]
            }}
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
      
      {/* Enhanced pulse effect when running */}
      {isRunning && (
        <>
          <motion.div
            className="absolute inset-0 border-2 border-white/20 rounded-3xl"
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.2, 0.5, 0.2],
              borderColor: ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 border border-white/10 rounded-3xl"
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          />
        </>
      )}
    </motion.div>
  )
}