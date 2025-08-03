import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnalysisResult from "./components/AnalysisResult";
import HistoryPage from "./components/HistoryPage";
import "./styles/index.css";
import "./styles/History.css";

function HomePage({
  text,
  setText,
  analysis,
  setAnalysis,
  loading,
  darkMode,
  toggleTheme,
  handleSubmit,
  history,
  clearHistory,
  deleteHistoryItem,
  navigateToHistory,
  language,
  toggleLanguage,
  saveHistory,
}) {
  const isHebrew = language === "he";
  const trimmedText = text.trim();

  return (
    <div
      className="min-h-screen px-4 py-8 pb-20 bg-transparent transition-colors duration-300"
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <div className="max-w-2xl mx-auto bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl shadow-xl rounded-xl p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            🕵️ TruthLens
          </h1>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 px-3 py-1 rounded hover:scale-105 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform"
            >
              {darkMode
                ? isHebrew
                  ? "☀️ מצב בהיר"
                  : "☀️ Light"
                : isHebrew
                ? "🌙 מצב כהה"
                : "🌙 Dark"}
            </button>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 px-3 py-1 rounded hover:scale-105 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform"
            >
              {isHebrew ? "English" : "עברית"}
            </button>
          </div>
        </header>

        {/* Description */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg font-medium leading-relaxed">
          {isHebrew
            ? "מערכת לזיהוי טענות שקריות או פייק ניוז בעזרת ניתוח בינה מלאכותית."
            : "AI-powered system to detect false claims and fake news."}
        </p>

        {/* Text Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="p-4 border dark:border-gray-600 rounded-md h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            placeholder={
              isHebrew
                ? "הדבק כאן פוסט או טענה לניתוח..."
                : "Paste a post or claim here for analysis..."
            }
            required
          />

          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!trimmedText}
                className={`bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform duration-200 ${
                  !trimmedText
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
              >
                🚀 {isHebrew ? "נתח טענה" : "Analyze Claim"}
              </button>
              <button
                type="button"
                onClick={navigateToHistory}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                📜 {isHebrew ? "היסטוריית טענות" : "Claim History"}
              </button>
            </div>

            <div className="flex flex-row-reverse gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (analysis) {
                    saveHistory(analysis);
                  }
                  setAnalysis(null);
                  setText("");
                }}
                className="bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-100 px-3 py-1 rounded-md shadow-sm hover:bg-red-200 dark:hover:bg-red-700 transition"
              >
                🔄 {isHebrew ? "אפס הכל" : "Reset All"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setText("החיסונים גורמים לאוטיזם");
                  setAnalysis(null);
                }}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                {isHebrew ? "טען טקסט לדוגמה" : "Load Sample Text"}
              </button>
            </div>
          </div>
        </form>

        {/* Loader */}
        {loading && (
          <motion.div
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mt-6"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        )}

        {/* Latest Analysis */}
        {analysis && <AnalysisResult result={analysis} language={language} />}
      </div>
    </div>
  );
}

export default function App() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("he");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    if (savedMode) document.documentElement.classList.add("dark");

    const savedHistory = localStorage.getItem("analysisHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.documentElement.classList.toggle("dark");
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "he" ? "en" : "he"));
  };

  const saveHistory = (item) => {
    const updatedHistory = [
      { id: Date.now(), ...item, timestamp: new Date().toISOString() },
      ...history,
    ];
    setHistory(updatedHistory);
    localStorage.setItem("analysisHistory", JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("analysisHistory");
  };

  const deleteHistoryItem = (id) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("analysisHistory", JSON.stringify(updatedHistory));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) {
      alert(
        language === "he" ? "אנא הזן טקסט חוקי." : "Please enter valid text."
      );
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmedText }),
      });
      const data = await res.json();

      const result = {
        input_text: trimmedText,
        analysis_summary: data.summary || "",
        certainty_score: data.certainty
          ? Math.round(data.certainty * 100)
          : null,
        identified_issues:
          data.bias_flags?.length > 0 ||
          data.misinformation_patterns?.length > 0
            ? [
                ...(data.bias_flags?.length > 0 ? ["bias"] : []),
                ...(data.misinformation_patterns?.length > 0
                  ? ["misinformation"]
                  : []),
              ]
            : [],
        detailed_analysis: [
          ...(data.misinformation_patterns || []),
          ...(data.bias_flags || []),
          ...(data.evidence || []),
        ],
        metadata: {
          model: data.metadata?.model || data.model || "",
          timestamp: data.metadata?.timestamp || new Date().toISOString(),
          token_usage:
            typeof data.metadata?.token_usage === "number"
              ? data.metadata.token_usage
              : data.token_usage || 0,
        },
      };

      setAnalysis(result);
      saveHistory(result);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToHistory = () => {
    navigate("/history");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            text={text}
            setText={setText}
            analysis={analysis}
            setAnalysis={setAnalysis}
            loading={loading}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            handleSubmit={handleSubmit}
            history={history}
            clearHistory={clearHistory}
            deleteHistoryItem={deleteHistoryItem}
            navigateToHistory={navigateToHistory}
            language={language}
            toggleLanguage={toggleLanguage}
            saveHistory={saveHistory}
          />
        }
      />
      <Route
        path="/history"
        element={
          <HistoryPage
            history={history}
            clearHistory={clearHistory}
            deleteHistoryItem={deleteHistoryItem}
          />
        }
      />
    </Routes>
  );
}
