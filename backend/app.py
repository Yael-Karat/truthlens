from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_integration import analyze_text_with_ai

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    print("טקסט שהתקבל לניתוח:", text)
    if not text:
        return jsonify({"status": "error", "message": "לא התקבל טקסט לניתוח."}), 400

    result = analyze_text_with_ai(text)
    print("תוצאה מה-AI:", result)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
