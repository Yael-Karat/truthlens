import React, { useState } from 'react';
import AnalysisResult from './components/AnalysisResult';
import './styles/App.css';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeText = async () => {
    if (!inputText.trim()) {
      setError('אנא הזן טקסט לניתוח.');
      setResult(null);
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) throw new Error('שגיאה בשרת');

      const data = await response.json();
      setResult(data.analysis);
    } catch {
      setError('אירעה שגיאה במהלך הניתוח. נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" role="main">
      <h1>TruthLens - כלי לזיהוי דיסאינפורמציה</h1>

      <textarea
        placeholder="הזן טקסט לבדיקה כאן..."
        rows={6}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        aria-label="טקסט לבדיקה"
      />

      <button onClick={analyzeText} disabled={loading} aria-busy={loading}>
        {loading ? 'מנתח...' : 'נתח טקסט'}
      </button>

      {error && <div className="error-message" role="alert">{error}</div>}

      {result && <AnalysisResult analysis={result} />}
    </div>
  );
}
