import os
import openai
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

if not openai.api_key:
    raise ValueError("ERROR: OPENAI_API_KEY לא מוגדר בסביבת העבודה.")

def analyze_text_with_ai(text):
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "אתה עוזר שמנתח מידע מטעה ברשתות חברתיות."},
                {"role": "user", "content": f"האם יש בעיה בטקסט הבא: '{text}'?"}
            ],
            temperature=0.5,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"שגיאה בזמן ניתוח הטקסט: {str(e)}"
