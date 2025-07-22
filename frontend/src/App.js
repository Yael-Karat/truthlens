import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnalysisResult from './components/AnalysisResult'

export default function App() {
  const [text, setText] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // שמירת מצב כהה בלוקאל סטורג׳
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedMode)
    if (savedMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', newMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      setAnalysis(data.analysis)
    } catch (err) {
      setAnalysis('❌ Failed to analyze text.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            🕵️ TruthLens
          </h1>
          <button
            onClick={toggleTheme}
            className="bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 px-3 py-1 rounded hover:scale-105 transition-transform"
          >
            {darkMode ? '🌞 מצב בהיר' : '🌙 מצב כהה'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="p-4 border dark:border-gray-600 rounded-md h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            placeholder="הדבק כאן פוסט או טענה לניתוח..."
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition"
          >
            🚀 נתח טענה
          </button>
        </form>

        {loading && (
          <motion.div
            className="text-center text-xl mt-6 text-blue-500 dark:text-blue-300"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            🔄 מנתח טקסט...
          </motion.div>
        )}

        {analysis && <AnalysisResult text={analysis} />}
      </div>
    </div>
  )
}
