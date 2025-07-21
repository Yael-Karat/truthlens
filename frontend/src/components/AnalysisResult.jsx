// src/components/AnalysisResult.jsx
import React from 'react'
import { motion } from 'framer-motion'

export default function AnalysisResult({ text }) {
  const getColor = () => {
    if (text.includes('❌')) return 'bg-red-100 text-red-800 border-red-300'
    if (text.includes('⚠️')) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  return (
    <motion.div
      className={`border p-4 mt-4 rounded ${getColor()}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {text}
    </motion.div>
  )
}
