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

        {history.length === 0 ? (
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
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div className="history-text">
                    <strong>טקסט:</strong> {item.input_text.slice(0, 50)}...
                    <br />
                    <strong>מסקנה:</strong> {item.verdict}
                    <br />
                    <strong>סיכום:</strong> {item.summary}
                    <br />
                    <span className="history-timestamp">
                      ({new Date(item.timestamp).toLocaleString()})
                    </span>
                  </div>
                  <button
                    className="history-delete-btn"
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
