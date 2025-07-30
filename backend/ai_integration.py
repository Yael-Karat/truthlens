import os
import requests
import json
import time
import random
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def analyze_with_chatgpt_strict(text, max_retries=3):
    """Strict JSON-only academic analysis using OpenAI API"""
    if not OPENAI_API_KEY:
        return {"error": "Missing OpenAI API key"}

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""
You are a strict JSON-only API that analyzes social media posts for misinformation, bias, and factual completeness.

Your task is to evaluate the following text and return a comprehensive academic-style analysis strictly in the following JSON format and nothing else.

Text to analyze:
\"\"\"{text}\"\"\"

JSON Schema:
{{
  "status": "success",
  "verdict": "true/false/suspicious/unknown",
  "certainty": 0.0,  // Float between 0 and 1
  "summary": "Concise academic-style explanation of your reasoning.",
  "evidence": ["Optional supporting facts or context if available"],
  "bias_flags": ["Potential indicators of bias or emotional language"],
  "misinformation_patterns": ["Detected misinformation techniques, if any"],
  "claim_type": "general/political/scientific/health/other"
}}
"""

    data = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a JSON-only misinformation and bias detection API. Never reply with anything except valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 500
    }

    for attempt in range(max_retries):
        try:
            if attempt > 0:
                wait = (2 ** attempt) + random.uniform(1, 2)
                print(f"Retrying ChatGPT (attempt {attempt + 1})... waiting {wait:.1f}s")
                time.sleep(wait)

            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data, timeout=45)
            response.raise_for_status()
            result = response.json()
            content = result['choices'][0]['message']['content'].strip()

            # Extract JSON
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()

            return json.loads(content)

        except Exception as e:
            print(f"⚠️ Error (attempt {attempt + 1}): {e}")

    return {"status": "error", "message": f"OpenAI analysis failed after {max_retries} retries."}


def analyze_text_with_ai(text):
    """Main analysis function using OpenAI only"""
    text = (text or "").strip()
    print(f"📩 Analyzing text: \"{text}\"")

    analysis = analyze_with_chatgpt_strict(text)
    if "error" in analysis:
        return {
            "status": "error",
            "message": analysis["error"],
            "verdict": "unknown",
            "summary": "",
            "certainty": None,
            "bias_flags": [],
            "misinformation_patterns": [],
            "claim_type": "unknown",
            "evidence": []
        }

    return analysis
