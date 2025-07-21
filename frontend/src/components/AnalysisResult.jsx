import React, { useState } from 'react';
import '../styles/AnalysisResult.css';

const icons = {
  warning: '⚠️',
  success: '✅',
};

export default function AnalysisResult({ analysis }) {
  const [expanded, setExpanded] = useState(false);

  if (typeof analysis === 'string') {
    const isWarning = analysis.startsWith('⚠️');
    const className = isWarning ? 'analysis-container warning' : 'analysis-container success';

    return (
      <div className={className} role="alert">
        <div className="analysis-message">
          <span className="icon">{icons[isWarning ? 'warning' : 'success']}</span>
          {analysis}
        </div>
      </div>
    );
  }

  const { message, details, score, severity } = analysis;
  const hasDetails = Array.isArray(details) && details.length > 0;

  return (
    <div className="analysis-container warning" role="alert">
      <div className="analysis-message">
        <span className="icon">{icons.warning}</span>
        {message}
      </div>

      {hasDetails && (
        <>
          <ul className="details-list">
            {(expanded ? details : details.slice(0, 2)).map((detail, idx) => (
              <li key={idx}>{detail}</li>
            ))}
          </ul>
          {details.length > 2 && (
            <button
              className="read-more-btn"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              {expanded ? 'קרא פחות' : 'קרא עוד'}
            </button>
          )}
        </>
      )}

      <div className="score-severity">
        <div>
          ציון הערכה:
          <span>{score} / 100</span>
        </div>
        <div>
          רמת חומרה:
          <span>{severity}</span>
        </div>
      </div>
    </div>
  );
}
