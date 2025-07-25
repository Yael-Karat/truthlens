import React from 'react'
import { motion } from 'framer-motion'

export default function AnalysisResult({ verdict, text, sources = [] }) {
  const getStyle = () => {
    switch (verdict) {
      case 'true':
        return {
          icon: '✅',
          classes: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-600'
        }
      case 'false':
        return {
          icon: '❌',
          classes: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-600'
        }
      case 'unknown':
      default:
        return {
          icon: '⚠️',
          classes: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-600'
        }
    }
  }

  const { icon, classes } = getStyle()

  return (
    <motion.div
      className={`border p-4 mt-6 rounded-lg shadow flex flex-col gap-3 ${classes}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-2">
        <span className="text-2xl mt-1">{icon}</span>
        <div className="whitespace-pre-wrap leading-relaxed text-base font-medium">{text}</div>
      </div>

      {sources.length > 0 && (
        <div className="pl-9 text-sm text-blue-800 underline space-y-1">
          {sources.map((src, idx) => (
            <div key={idx}>
              <a href={src} target="_blank" rel="noopener noreferrer">
                מקור {idx + 1}
              </a>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
