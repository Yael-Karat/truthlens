import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/History.css";

export default function HistoryPage({
  history,
  deleteHistoryItem,
  clearHistory,
  language,
}) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const isHebrew = language === "he";

  const handleDelete = () => {
    if (modalAction === "clear") {
      clearHistory();
    } else if (typeof modalAction === "number") {
      deleteHistoryItem(modalAction);
    }
    setShowModal(false);
    setModalAction(null);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <div
      className="min-h-screen px-4 py-8 bg-transparent transition-colors duration-300"
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <div className="max-w-2xl mx-auto bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl shadow-xl rounded-xl p-6">
        <header className="flex justify-between items-center mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            📜 {isHebrew ? "היסטוריית טענות" : "Claim History"}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow"
          >
            🔙 {isHebrew ? "חזרה" : "Back"}
          </button>
        </header>

        {!history || history.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            {isHebrew
              ? "אין ניתוחים בהיסטוריה."
              : "No analysis history available."}
          </p>
        ) : (
          <>
            <button
              onClick={() => {
                setShowModal(true);
                setModalAction("clear");
              }}
              className="mb-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
            >
              🗑️ {isHebrew ? "נקה הכל" : "Clear All"}
            </button>

            <ul className="history-list space-y-6">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="history-item p-4 border rounded-lg bg-white/80 dark:bg-gray-700/80 shadow-sm"
                >
                  <div className="mb-2">
                    <strong>{isHebrew ? "טענה:" : "Claim:"}</strong>
                    <p className="mt-1">{item.input_text || "לא זמין"}</p>
                  </div>
                  <div className="mb-2">
                    <strong>
                      {isHebrew ? "סיכום הניתוח:" : "Analysis Summary:"}
                    </strong>
                    <p className="mt-1">{item.analysis_summary || "לא זמין"}</p>
                  </div>
                  <div className="mb-2">
                    <strong>
                      {isHebrew ? "ציון ודאות:" : "Certainty Score:"}
                    </strong>
                    <p className="mt-1">
                      {item.certainty_score !== null &&
                      item.certainty_score !== undefined
                        ? `${item.certainty_score}%`
                        : isHebrew
                        ? "לא זמין"
                        : "Unavailable"}
                    </p>
                  </div>
                  <div className="mb-2">
                    <strong>
                      {isHebrew ? "בעיות שזוהו:" : "Identified Issues:"}
                    </strong>
                    <p className="mt-1">
                      {item.identified_issues &&
                      item.identified_issues.length > 0
                        ? item.identified_issues.join(", ")
                        : isHebrew
                        ? "לא זוהו"
                        : "None identified"}
                    </p>
                  </div>
                  <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    {item.metadata?.timestamp
                      ? new Date(item.metadata.timestamp).toLocaleString()
                      : isHebrew
                      ? "זמן לא זמין"
                      : "Time unavailable"}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow-sm"
                      onClick={() => {
                        setShowModal(true);
                        setModalAction(item.id);
                      }}
                    >
                      {isHebrew ? "מחק" : "Delete"}
                    </button>

                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow-sm"
                      onClick={() => handleCopy(item.input_text || "", item.id)}
                    >
                      {copiedId === item.id
                        ? isHebrew
                          ? "הועתק!"
                          : "Copied!"
                        : isHebrew
                        ? "העתק טענה"
                        : "Copy Claim"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Disclaimer */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-6 text-center">
          {isHebrew
            ? "⚠️ ניתוח זה מתבצע באמצעות בינה מלאכותית ועשוי להכיל שגיאות. מומלץ לאמת מידע חשוב באופן עצמאי."
            : "⚠️ This analysis is generated using AI and may contain errors. Important information should be independently verified."}
        </p>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {modalAction === "clear"
                ? isHebrew
                  ? "האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?"
                  : "Are you sure you want to delete all history?"
                : isHebrew
                ? "האם אתה בטוח שברצונך למחוק טענה זו?"
                : "Are you sure you want to delete this claim?"}
            </h2>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                {isHebrew ? "ביטול" : "Cancel"}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                {isHebrew ? "אישור" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
