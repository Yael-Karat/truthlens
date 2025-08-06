from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_integration import analyze_text_with_ai
import os
import json
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

HISTORY_FILE = "history.json"

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_history(history_list):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history_list, f, ensure_ascii=False, indent=2)

def add_to_history(input_text, result):
    history = load_history()
    new_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "input_text": input_text,
        "result": result
    }
    history.insert(0, new_entry)
    save_history(history)
    return new_entry

def delete_history_item(item_id):
    history = load_history()
    new_history = [h for h in history if h["id"] != item_id]
    if len(new_history) != len(history):
        save_history(new_history)
        return True
    return False

def clear_history():
    save_history([])
    return True

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({
            "status": "error",
            "message": "לא התקבל טקסט תקין לניתוח.",
            "verdict": "unknown",
            "summary": "",
            "sources": [],
            "trust": None,
            "chatgpt_analysis": None
        }), 400

    result = analyze_text_with_ai(text)

    saved_entry = add_to_history(text, result)

    response = {
        "status": result.get("status", "error"),
        "verdict": result.get("verdict", "unknown"),
        "summary": result.get("summary", ""),
        "certainty": result.get("certainty", None),
        "bias_flags": result.get("bias_flags", []),
        "misinformation_patterns": result.get("misinformation_patterns", []),
        "claim_type": result.get("claim_type", "unknown"),
        "evidence": result.get("evidence", []),
        "metadata": result.get("metadata", {}),
        "history_id": saved_entry["id"]
    }

    return jsonify(response)

@app.route("/history", methods=["GET"])
def get_history():
    return jsonify(load_history())

@app.route("/history/<item_id>", methods=["DELETE"])
def delete_item(item_id):
    if delete_history_item(item_id):
        return jsonify({"status": "success", "message": "הפריט נמחק."})
    return jsonify({"status": "error", "message": "לא נמצא פריט עם ID כזה."}), 404

@app.route("/history", methods=["DELETE"])
def clear_all_history():
    clear_history()
    return jsonify({"status": "success", "message": "ההיסטוריה נמחקה כולה."})

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "TruthLens API is running",
        "features": ["ChatGPT Analysis"]
    })

if __name__ == "__main__":
    app.run(debug=True)
