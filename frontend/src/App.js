import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnalysisResult from './components/AnalysisResult'
import './styles/index.css'

export default function App() {
  const [text, setText] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

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
      console.log('🔥 תגובה מהשרת:', data)

      if (data.status === 'not_found') {
        setAnalysis({
          verdict: 'unknown',
          summary: 'לא נמצאה טענה דומה במסד הנתונים.',
          sources: []
        })
      } else if (data.status === 'success') {
        setAnalysis({
          verdict: data.verdict || 'unknown',
          summary: data.summary || 'אין סיכום זמין.',
          sources: data.sources || []
        })
      } else {
        setAnalysis({
          verdict: 'error',
          summary: 'שגיאה: לא התקבל ניתוח תקין מהשרת.',
          sources: []
        })
      }
    } catch (err) {
      console.error('⚠️ שגיאה:', err)
      setAnalysis({
        verdict: 'error',
        summary: 'שגיאה: לא הצלחנו לנתח את הטקסט.',
        sources: []
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-transparent transition-colors duration-300" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl shadow-xl rounded-xl p-6">
        <header className="flex justify-between items-center mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            🕵️ TruthLens
          </h1>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 px-3 py-1 rounded hover:scale-105 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform"
          >
            {darkMode ? '☀️ מצב בהיר' : '🌙 מצב כהה'}
          </button>
        </header>

        <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg font-medium leading-relaxed">
          מערכת לזיהוי טענות שקריות או פייק ניוז בעזרת ניתוח בינה מלאכותית.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="p-4 border dark:border-gray-600 rounded-md h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            placeholder="הדבק כאן פוסט או טענה לניתוח..."
            required
          />

          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
              >
                🚀 נתח טענה
              </button>
            </div>

            <div className="flex flex-row-reverse gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setText('')
                  setAnalysis(null)
                }}
                className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-100 px-3 py-1 rounded-md shadow-sm hover:bg-red-200 dark:hover:bg-red-700 transition"
              >
                🔄 אפס הכל
              </button>

              <button
                type="button"
                onClick={() => {
                  setText('החיסונים גורמים לאוטיזם')
                  setAnalysis(null)
                }}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                טען טקסט לדוגמה
              </button>
            </div>
          </div>
        </form>

        {loading && (
          <motion.div
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mt-6"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        )}

        {analysis && <AnalysisResult verdict={analysis.verdict} text={analysis.summary} sources={analysis.sources} />}
      </div>
    </div>
  )
}
