import React from "react";
import { motion } from "framer-motion";

const TrustStars = ({ score }) => {
  const fullStars = Math.round((score || 0) / 20); // ממיר 0-100 ל-0-5 כוכבים
  return (
    <div className="text-yellow-500 text-xl flex gap-1 min-w-[100px]">
      {[...Array(5)].map((_, i) => (
        <span key={i}>{i < fullStars ? "⭐" : "☆"}</span>
      ))}
      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
        ({score || 0}/100)
      </span>
    </div>
  );
};

const VerdictBadge = ({ verdict }) => {
  const getBadgeStyle = () => {
    switch (verdict) {
      case "true":
        return {
          icon: "✅",
          text: "נכון",
          classes:
            "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200",
        };
      case "false":
        return {
          icon: "❌",
          text: "שקרי",
          classes:
            "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200",
        };
      case "suspicious":
        return {
          icon: "🚩",
          text: "חשוד",
          classes:
            "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200",
        };
      case "possibly_false":
        return {
          icon: "⚠️",
          text: "כנראה שקרי",
          classes:
            "bg-red-100/70 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300",
        };
      case "unknown":
      default:
        return {
          icon: "❓",
          text: "לא ברור",
          classes:
            "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200",
        };
    }
  };

  const { icon, text, classes } = getBadgeStyle();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${classes} font-semibold`}
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </div>
  );
};

export default function AnalysisResult({
  verdict,
  text,
  sources = [],
  trust = null,
  wikipedia = null,
  chatgpt_analysis = null,
  similarity = null,
  ai_enhanced = false,
  status = "success",
}) {
  const getContainerStyle = () => {
    switch (verdict) {
      case "true":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700";
      case "false":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700";
      case "suspicious":
        return "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700";
      case "unknown":
      default:
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700";
    }
  };

  return (
    <motion.div
      className={`border-2 p-6 mt-6 rounded-xl shadow-lg ${getContainerStyle()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* כותרת עם תג סטטוס */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <VerdictBadge verdict={verdict} />
        <div className="flex items-center gap-3">
          {ai_enhanced && (
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md text-xs font-medium">
              🤖 AI Enhanced
            </div>
          )}
          {similarity && (
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-medium">
              דמיון: {Math.round(similarity * 100)}%
            </div>
          )}
          {trust !== null && <TrustStars score={trust} />}
        </div>
      </div>

      {/* טקסט ראשי */}
      <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-base mb-4 whitespace-pre-wrap">
        {text}
      </div>

      {/* מידע מ-ChatGPT אם קיים */}
      {chatgpt_analysis && !chatgpt_analysis.error && (
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 mb-4 border-l-4 border-blue-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="font-semibold text-blue-900 dark:text-blue-300">
              ניתוח ChatGPT
            </span>
          </div>

          {chatgpt_analysis.analysis && (
            <div className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>ניתוח:</strong> {chatgpt_analysis.analysis}
            </div>
          )}

          {chatgpt_analysis.potential_red_flags &&
            chatgpt_analysis.potential_red_flags.length > 0 && (
              <div className="text-red-700 dark:text-red-300 mb-2">
                <strong>🚩 דגלים אדומים:</strong>{" "}
                {chatgpt_analysis.potential_red_flags.join(", ")}
              </div>
            )}

          {chatgpt_analysis.keywords &&
            chatgpt_analysis.keywords.length > 0 && (
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                <strong>מילות מפתח:</strong>{" "}
                {chatgpt_analysis.keywords.join(", ")}
              </div>
            )}

          {chatgpt_analysis.confidence && (
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              <strong>רמת ביטחון:</strong>{" "}
              {Math.round(chatgpt_analysis.confidence * 100)}%
            </div>
          )}
        </div>
      )}

      {/* מידע מוויקיפדיה */}
      {wikipedia && (
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 mb-4 border-l-4 border-purple-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📚</span>
            <span className="font-semibold text-purple-900 dark:text-purple-300">
              ויקיפדיה: {wikipedia.title}
            </span>
          </div>
          <div className="text-gray-700 dark:text-gray-300 mb-2">
            {wikipedia.snippet}
          </div>
          {wikipedia.url && (
            <a
              href={wikipedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 underline hover:text-purple-800 dark:hover:text-purple-200 transition"
            >
              → קרא עוד בוויקיפדיה
            </a>
          )}
        </div>
      )}

      {/* מקורות */}
      {sources.length > 0 && (
        <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border-l-4 border-green-400">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔗</span>
            <span className="font-semibold text-green-900 dark:text-green-300">
              מקורות לאימות
            </span>
          </div>
          <div className="space-y-2">
            {sources.map((src, idx) => (
              <div key={idx}>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400 underline hover:text-green-800 dark:hover:text-green-200 transition block"
                >
                  📄 מקור {idx + 1}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* הודעת סטטוס אם יש */}
      {status !== "success" && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
          סטטוס: {status}
        </div>
      )}
    </motion.div>
  );
}
