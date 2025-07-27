from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_integration import analyze_text_with_ai

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = (data.get("text") or "").strip()  # ✅ מנקה רווחים ושורות חדשות

    print(f"טקסט שהתקבל לניתוח (אחרי strip): '{text}'")

    if not text:
        return jsonify({
            "status": "error",
            "message": "לא התקבל טקסט תקין לניתוח.",
            "verdict": "unknown",
            "summary": "",
            "sources": [],
            "trust": None,
            "wikipedia": None
        }), 400

    result = analyze_text_with_ai(text)
    print("תוצאה מה-AI:", result)

    response = {
        "status": result.get("status", "error"),
        "verdict": result.get("verdict", "unknown"),
        "summary": result.get("summary", ""),
        "sources": result.get("sources", []),
        "trust": result.get("trust", None),
        "wikipedia": result.get("wikipedia", None),
        "message": result.get("message", "")
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
