import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/History.css";

export default function HistoryPage({
  history,
  deleteHistoryItem,
  clearHistory,
}) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen px-4 py-8 bg-transparent transition-colors duration-300"
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl shadow-xl rounded-xl p-6">
        <header className="flex justify-between items-center mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            📜 היסטוריית טענות
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow"
          >
            🔙 חזרה
          </button>
        </header>

        {!history || history.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            אין ניתוחים בהיסטוריה.
          </p>
        ) : (
          <>
            <button
              onClick={clearHistory}
              className="mb-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
            >
              🗑️ נקה הכל
            </button>
            <ul className="history-list space-y-6">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="history-item p-4 border rounded-lg bg-white/80 dark:bg-gray-700/80 shadow-sm"
                >
                  <div className="mb-2">
                    <strong>טענה:</strong>
                    <p className="mt-1">{item.input_text || "לא זמין"}</p>
                  </div>
                  <div className="mb-2">
                    <strong>סיכום הניתוח:</strong>
                    <p className="mt-1">{item.analysis_summary || "לא זמין"}</p>
                  </div>
                  <div className="mb-2">
                    <strong>ציון ודאות:</strong>
                    <p className="mt-1">
                      {item.certainty_score !== null &&
                      item.certainty_score !== undefined
                        ? `${item.certainty_score}%`
                        : "לא זמין"}
                    </p>
                  </div>
                  <div className="mb-2">
                    <strong>בעיות שזוהו:</strong>
                    <p className="mt-1">
                      {item.identified_issues &&
                      item.identified_issues.length > 0
                        ? item.identified_issues.join(", ")
                        : "לא זוהו"}
                    </p>
                  </div>
                  <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    {item.metadata?.timestamp
                      ? new Date(item.metadata.timestamp).toLocaleString()
                      : "זמן לא זמין"}
                  </div>
                  <button
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow-sm"
                    onClick={() => deleteHistoryItem(item.id)}
                  >
                    מחק
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
