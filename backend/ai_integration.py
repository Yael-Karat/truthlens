import os
import requests
from dotenv import load_dotenv
import difflib

load_dotenv()

GOOGLE_FACT_CHECK_API_KEY = os.getenv("GOOGLE_FACT_CHECK_API_KEY")

def find_best_claim(text, claims, threshold=0.7):
    best_claim = None
    highest_score = 0
    for claim in claims:
        claim_text = claim.get("text", "")
        score = difflib.SequenceMatcher(None, text.lower(), claim_text.lower()).ratio()
        if score > highest_score:
            highest_score = score
            best_claim = claim
    if highest_score >= threshold:
        return best_claim, highest_score
    else:
        return None, highest_score

def analyze_claim_with_google_fact_check(text):
    if not GOOGLE_FACT_CHECK_API_KEY:
        return {
            "status": "error",
            "message": "Missing Google Fact Check API key.",
            "trust": None
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
                "status": "not_found"
            }

        top_claim, similarity_score = find_best_claim(text, data["claims"])

        if not top_claim:
            # לא נמצאה טענה עם דמיון מספק
            return {
                "status": "not_found",
                "similarity_score": similarity_score
            }

        claim_text = top_claim.get("text", "אין תיאור טענה")
        claim_review = top_claim.get("claimReview", [{}])[0]

        claim_rating = claim_review.get("textualRating", "אין דירוג")
        claim_url = claim_review.get("url", "")
        publisher = claim_review.get("publisher", {}).get("name", "מקור לא ידוע")

        rating_lower = claim_rating.lower()
        input_lower = text.lower()
        claim_text_lower = claim_text.lower()

        # מיפוי דירוג לאמינות מספרית
        if "pants on fire" in rating_lower:
            trust_score = 5
        elif "false" in rating_lower:
            trust_score = 20
        elif "mostly false" in rating_lower:
            trust_score = 30
        elif any(x in rating_lower for x in ["misleading", "partly false", "spins the facts"]):
            trust_score = 40
        elif "half true" in rating_lower:
            trust_score = 50
        elif "mostly true" in rating_lower:
            trust_score = 70
        elif any(x in rating_lower for x in ["true", "correct"]):
            trust_score = 90
        else:
            trust_score = 50

        negative_indicators = [
            "false", "pants on fire", "incorrect", "debunk", "hoax",
            "myth", "fake", "no", "not", "doesn't", "disprove", "wrong",
            "inaccurate", "misleading", "contrary", "refuted", "untrue"
        ]
        positive_indicators = [
            "true", "correct", "confirmed", "proven", "abundant evidence",
            "accurate", "valid", "supported", "verified"
        ]

        verdict = "unknown"

        # בדיקה אם הטענה שהוזנה תואמת את הטענה ב-claim_text לפי דמיון ומילות דירוג
        if similarity_score > 0.8:
            if any(neg in rating_lower for neg in negative_indicators):
                verdict = "false"
            elif any(pos in rating_lower for pos in positive_indicators):
                verdict = "true"
            else:
                verdict = "unknown"
        else:
            # אם דמיון נמוך יחסית, לא מחליטים ודאי
            verdict = "unknown"

        return {
            "status": "success",
            "verdict": verdict,
            "summary": f'הטענה דורגה כ: {claim_rating} על ידי {publisher}.',
            "sources": [claim_url] if claim_url else [],
            "trust": trust_score,
            "claim": claim_text,
            "claimReview": {
                "textualRating": claim_rating,
                "publisher": {"name": publisher},
                "url": claim_url
            }
        }

    except requests.exceptions.RequestException as e:
        return {
            "status": "error",
            "message": f"שגיאה בבדיקה מול Google Fact Check: {e}",
            "trust": None
        }

def search_wikipedia_summary(query):
    try:
        search_url = f"https://en.wikipedia.org/w/api.php"
        search_params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json"
        }
        search_response = requests.get(search_url, params=search_params)
        search_response.raise_for_status()
        search_data = search_response.json()

        if not search_data["query"]["search"]:
            return None

        page_title = search_data["query"]["search"][0]["title"]

        summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{page_title}"
        summary_response = requests.get(summary_url)
        summary_response.raise_for_status()
        summary_data = summary_response.json()

        return {
            "title": summary_data.get("title", ""),
            "snippet": summary_data.get("extract", ""),
            "url": summary_data.get("content_urls", {}).get("desktop", {}).get("page", "")
        }

    except requests.exceptions.RequestException:
        return None

def analyze_text_with_ai(text):
    print(f"📩 טקסט שהתקבל לניתוח: \"{text}\"")

    result = analyze_claim_with_google_fact_check(text)
    if result["status"] == "success":
        return result

    if result["status"] == "not_found":
        wiki_data = search_wikipedia_summary(text)
        if wiki_data:
            return {
                "status": "partial_success",
                "verdict": "unknown",
                "summary": f'נמצאה התייחסות בויקיפדיה: {wiki_data["snippet"]}',
                "sources": [wiki_data["url"]],
                "trust": 60,
                "wikipedia": wiki_data
            }

        return {
            "status": "not_found",
            "verdict": "unknown",
            "summary": "לא נמצאה טענה דומה במסדי הנתונים.",
            "sources": [],
            "trust": None
        }

    return {
        "status": "error",
        "message": result.get("message", "שגיאה לא ידועה."),
        "trust": None
    }
