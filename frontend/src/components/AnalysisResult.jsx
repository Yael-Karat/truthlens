import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";

const issueIcons = {
  misinformation: <ShieldAlert className="text-red-500 w-5 h-5 inline" />,
  bias: <AlertTriangle className="text-yellow-500 w-5 h-5 inline" />,
  "factual integrity": <Info className="text-blue-500 w-5 h-5 inline" />,
};

const issueColors = {
  misinformation: "bg-red-100 text-red-800 border-red-300",
  bias: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "factual integrity": "bg-blue-100 text-blue-800 border-blue-300",
};

const languageContent = {
  en: {
    summaryTitle: "Analysis Summary",
    certaintyLabel: "Certainty Score:",
    issuesTitle: "Identified Issues",
    detailsTitle: "Detailed Analysis",
    technicalTitle: "Technical Details",
  },
  he: {
    summaryTitle: "סיכום ניתוח",
    certaintyLabel: "מדד ודאות:",
    issuesTitle: "סוגיות שזוהו",
    detailsTitle: "ניתוח מפורט",
    technicalTitle: "פרטים טכניים",
  },
};

const ProgressBar = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
    <div
      className="bg-green-500 h-3 rounded-full transition-all"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const AnalysisResult = ({ result, lang }) => {
  if (!result) return null;

  const { summary, certainty, issues, detailed_analysis, technical } = result;

  const content = languageContent[lang] || languageContent.en;

  return (
    <motion.div
      className="max-w-3xl mx-auto mt-6 space-y-6 text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Summary */}
      <div className="rounded-2xl border border-gray-300 p-4 shadow-sm bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">{content.summaryTitle}</h2>
        <p className="text-gray-700 dark:text-gray-300">{summary}</p>
      </div>

      {/* Certainty */}
      <div className="rounded-2xl border border-gray-300 p-4 shadow-sm bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">
          {content.certaintyLabel} {certainty}%
        </h2>
        <ProgressBar value={certainty} />
      </div>

      {/* Issues */}
      {issues?.length > 0 && (
        <div className="rounded-2xl border border-gray-300 p-4 shadow-sm bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-2">{content.issuesTitle}</h2>
          <div className="flex flex-wrap gap-2">
            {issues.map((issue, idx) => (
              <span
                key={idx}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full border ${issueColors[issue]}`}
              >
                {issueIcons[issue]} <span className="capitalize">{issue}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detailed */}
      <div className="rounded-2xl border border-gray-300 p-4 shadow-sm bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">{content.detailsTitle}</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-200">
          {detailed_analysis.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Technical */}
      <div className="rounded-2xl border border-gray-300 p-4 shadow-sm bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-2">{content.technicalTitle}</h2>
        <pre className="text-xs bg-gray-100 p-2 rounded dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-x-auto">
          {JSON.stringify(technical, null, 2)}
        </pre>
      </div>
    </motion.div>
  );
};

export default AnalysisResult;
