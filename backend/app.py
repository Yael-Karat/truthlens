from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_integration import analyze_text_with_ai  # הקובץ המשופר
import os
import json
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

HISTORY_FILE = "history.json"

# -------- פונקציות עזר להיסטוריה --------

def load_history():
    """טוען היסטוריה מהקובץ (אם קיים), אחרת מחזיר רשימה ריקה"""
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_history(history_list):
    """שומר רשימת היסטוריה לקובץ"""
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history_list, f, ensure_ascii=False, indent=2)

def add_to_history(input_text, result):
    """יוצר רשומה ושומר אותה להיסטוריה"""
    history = load_history()
    new_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "input_text": input_text,
        "result": result
    }
    history.insert(0, new_entry)  # מוסיף לראש הרשימה (האחרון ראשון)
    save_history(history)
    return new_entry

def delete_history_item(item_id):
    """מוחק פריט לפי ID"""
    history = load_history()
    new_history = [h for h in history if h["id"] != item_id]
    if len(new_history) != len(history):
        save_history(new_history)
        return True
    return False

def clear_history():
    """מנקה את כל ההיסטוריה"""
    save_history([])
    return True

# -------- API עיקרי --------

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = (data.get("text") or "").strip()

    print(f"טקסט שהתקבל לניתוח (אחרי strip): '{text}'")

    if not text:
        return jsonify({
            "status": "error",
            "message": "לא התקבל טקסט תקין לניתוח.",
            "verdict": "unknown",
            "summary": "",
            "sources": [],
            "trust": None,
            "wikipedia": None,
            "chatgpt_analysis": None
        }), 400

    result = analyze_text_with_ai(text)
    print("תוצאה מה-AI המשופר:", result)

    # שמירה בהיסטוריה
    saved_entry = add_to_history(text, result)

    # הכנת תגובה משופרת
    response = {
        "status": result.get("status", "error"),
        "verdict": result.get("verdict", "unknown"),
        "summary": result.get("summary", ""),
        "sources": result.get("sources", []),
        "trust": result.get("trust", None),
        "wikipedia": result.get("wikipedia", None),
        "message": result.get("message", ""),
        "history_id": saved_entry["id"],
        # מידע נוסף מ-ChatGPT
        "chatgpt_analysis": result.get("chatgpt_analysis", None),
        "similarity": result.get("similarity", None)
    }

    return jsonify(response)

# -------- API היסטוריה --------

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
    """בדיקת תקינות המערכת"""
    return jsonify({
        "status": "healthy",
        "message": "TruthLens API is running",
        "features": ["Google Fact Check", "ChatGPT Analysis", "Wikipedia Search"]
    })

if __name__ == "__main__":
    app.run(debug=True)