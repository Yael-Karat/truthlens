from flask import Flask, request, jsonify
from ai_integration import analyze_text_with_ai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # מאפשר גישה מ־frontend (למשל React או Flask-based JS)

@app.route('/')
def home():
    return "Welcome to TruthLens backend! Use POST /analyze with JSON {\"text\": \"your text here\"} to analyze."

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '').strip()

    if not text:
        return jsonify({'error': 'לא התקבל טקסט לניתוח'}), 400

    analysis = analyze_text_with_ai(text)
    return jsonify({'analysis': analysis})

if __name__ == '__main__':
    app.run(debug=True)
