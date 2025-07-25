import os
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_FACT_CHECK_API_KEY = os.getenv("GOOGLE_FACT_CHECK_API_KEY")

def analyze_claim_with_google_fact_check(text):
    if not GOOGLE_FACT_CHECK_API_KEY:
        return {
            "status": "error",
            "message": "Missing Google Fact Check API key."
        }

    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {
        "query": text,
        "languageCode": "en",
        "key": GOOGLE_FACT_CHECK_API_KEY
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        print("🔍 Google API raw response:")
        print(data)

        if "claims" not in data or not data["claims"]:
            return {
                "status": "not_found",
                "message": "לא נמצאו טענות דומות במסד הנתונים של Google."
            }

        top_claim = data["claims"][0]
        claim_text = top_claim.get("text", "אין תיאור טענה")
        claim_review = top_claim.get("claimReview", [{}])[0]

        claim_rating = claim_review.get("textualRating", "אין דירוג")
        claim_url = claim_review.get("url", "")
        publisher = claim_review.get("publisher", {}).get("name", "מקור לא ידוע")

        # דירוג אמינות כמשקל מספרי (0-100) לדוגמה
        rating_lower = claim_rating.lower()
        if "false" in rating_lower:
            trust_score = 20
        elif "true" in rating_lower or "correct" in rating_lower:
            trust_score = 80
        else:
            trust_score = 50

        return {
            "status": "success",
            "verdict": "false" if "false" in rating_lower else "true",
            "summary": f'הטענה דורגה כ: {claim_rating} על ידי {publisher}.',
            "sources": [claim_url],
            "trust": trust_score
        }

    except requests.exceptions.RequestException as e:
        return {
            "status": "error",
            "message": f"שגיאה בבדיקה: {e}"
        }

def analyze_text_with_ai(text):
    print(f"📩 טקסט שהתקבל לניתוח: \"{text}\"")
    result = analyze_claim_with_google_fact_check(text)

    if result["status"] == "success":
        return result

    elif result["status"] == "not_found":
        return {
            "status": "not_found",
            "verdict": "unknown",
            "summary": "לא נמצאה טענה דומה במסד הנתונים.",
            "sources": [],
            "trust": None
        }

    else:
        return {
            "status": "error",
            "message": result.get("message", "שגיאה לא ידועה."),
            "trust": None
        }
