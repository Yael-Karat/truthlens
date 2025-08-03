import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info, CircleHelp } from "lucide-react";
import { clsx } from "clsx";

export default function AnalysisResult({ result, language }) {
  if (!result) return null;

  console.log("AnalysisResult metadata:", result.metadata);

  const t = (en, he) => (language === "he" ? he : en);

  const getScoreColor = (score) => {
    if (score >= 85) return "bg-green-500 text-white";
    if (score >= 60) return "bg-yellow-400 text-black";
    if (score >= 40) return "bg-orange-400 text-black";
    return "bg-red-500 text-white";
  };

  const issueColors = {
    misinformation: "bg-red-100 text-red-800",
    bias: "bg-yellow-100 text-yellow-800",
    conspiracy: "bg-purple-100 text-purple-800",
    factual_incompleteness: "bg-blue-100 text-blue-800",
  };

  const issueIcons = {
    misinformation: <AlertCircle className="w-5 h-5 text-red-600" />,
    bias: <Info className="w-5 h-5 text-yellow-600" />,
    conspiracy: <CircleHelp className="w-5 h-5 text-purple-600" />,
    factual_incompleteness: <Info className="w-5 h-5 text-blue-600" />,
  };

  const issueDescriptions = {
    misinformation: t(
      "Contains false or misleading information.",
      "מכיל מידע שגוי או מטעה."
    ),
    bias: t(
      "Presents information with clear bias.",
      "מציג מידע עם הטיה ברורה."
    ),
    conspiracy: t(
      "Reflects conspiracy theory language or patterns.",
      "מכיל תכנים המזוהים עם תאוריות קונספירציה."
    ),
    factual_incompleteness: t(
      "Lacks key factual elements.",
      "חסרים בו רכיבים עובדתיים חשובים."
    ),
  };

  // פיצול סוגי הבעיות לקטגוריות
  const misinformationIssues = result.identified_issues?.filter(
    (i) => i === "misinformation"
  );
  const biasIssues = result.identified_issues?.filter((i) => i === "bias");
  const conspiracyIssues = result.identified_issues?.filter(
    (i) => i === "conspiracy"
  );
  const factualIssues = result.identified_issues?.filter(
    (i) => i === "factual_incompleteness"
  );

  return (
    <motion.div
      className="mt-8 w-full rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-lg space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Analysis Summary */}
      <div>
        <h2 className="text-xl font-bold mb-2">
          {t("Analysis Summary", "סיכום הניתוח")}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {result.analysis_summary}
        </p>
      </div>

      {/* Certainty Score */}
      <div>
        <h2 className="text-xl font-bold mb-2">
          {t("Certainty Score", "ציון ודאות")}
        </h2>
        <div
          className={clsx(
            "w-fit px-4 py-2 rounded-full font-semibold",
            getScoreColor(result.certainty_score)
          )}
        >
          {result.certainty_score}%
        </div>
      </div>

      {/* Cognitive Biases Section */}
      {biasIssues?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">
            {t("Cognitive Biases Detected", "הטיות קוגניטיביות שזוהו")}
          </h2>
          <ul className="space-y-2">
            {biasIssues.map((issue, idx) => (
              <li
                key={idx}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  issueColors[issue] || "bg-yellow-200 text-yellow-900"
                )}
              >
                {issueIcons[issue] || <Info className="w-5 h-5" />}
                <span className="capitalize font-medium">
                  {t(issue.replace(/_/g, " "), issueLabelsHe[issue] || issue)}
                </span>
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {issueDescriptions[issue]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Other Identified Issues */}
      {(misinformationIssues?.length > 0 ||
        conspiracyIssues?.length > 0 ||
        factualIssues?.length > 0) && (
        <div>
          <h2 className="text-xl font-bold mb-2">
            {t("Key Problems", "בעיות מרכזיות")}
          </h2>
          <ul className="space-y-2">
            {[
              ...misinformationIssues,
              ...conspiracyIssues,
              ...factualIssues,
            ].map((issue, idx) => (
              <li
                key={idx}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  issueColors[issue] || "bg-gray-200 text-gray-800"
                )}
              >
                {issueIcons[issue] || (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <span className="capitalize font-medium">
                  {t(issue.replace(/_/g, " "), issueLabelsHe[issue] || issue)}
                </span>
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {issueDescriptions[issue]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Analysis */}
      {result.detailed_analysis?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">
            {t("Detailed Analysis", "ניתוח מפורט")}
          </h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {result.detailed_analysis.map((item, idx) => (
              <li key={idx} className="whitespace-pre-wrap">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Info */}
      <div>
        <h2 className="text-xl font-bold mb-2">
          {t("Technical Details", "פרטים טכניים")}
        </h2>
        <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <li>
            <strong>{t("Timestamp", "חותמת זמן")}:</strong>{" "}
            {result.metadata?.timestamp
              ? new Date(result.metadata.timestamp).toLocaleString(
                  language === "he" ? "he-IL" : "en-US"
                )
              : "N/A"}
          </li>
          <li>
            <strong>{t("Model Used", "מודל בשימוש")}:</strong>{" "}
            {result.metadata?.model ?? "N/A"}
          </li>
          <li>
            <strong>{t("Token Usage", "שימוש בטוקנים")}:</strong>{" "}
            {typeof result.metadata?.token_usage === "number" &&
            result.metadata.token_usage >= 0
              ? result.metadata.token_usage
              : "N/A"}
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

const issueLabelsHe = {
  misinformation: "מידע שגוי",
  bias: "הטיה",
  conspiracy: "תיאוריית קונספירציה",
  factual_incompleteness: "חוסר עובדתיות",
};
