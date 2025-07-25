import React from 'react'
import { motion } from 'framer-motion'

export default function AnalysisResult({ text }) {
  const getStyle = () => {
    const lowerText = text.toLowerCase()

    if (text.includes('❌') || lowerText.includes('שקר') || lowerText.includes('לא נכון')) {
      return {
        icon: '❌',
        classes: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-600',
      }
    }

    if (text.includes('⚠️') || lowerText.includes('לא מאומת') || lowerText.includes('אזהרה')) {
      return {
        icon: '⚠️',
        classes: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-600',
      }
    }

    return {
      icon: '✅',
      classes: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-600',
    }
  }

  const { icon, classes } = getStyle()

  return (
    <motion.div
      className={`border p-4 mt-6 rounded-lg shadow flex items-start gap-3 ${classes}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="text-2xl mt-1">{icon}</span>
      <div className="whitespace-pre-wrap leading-relaxed text-base font-medium">{text}</div>
    </motion.div>
  )
}
