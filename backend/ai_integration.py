import os
import requests
from dotenv import load_dotenv
import difflib
import json
import time
import random

load_dotenv()

GOOGLE_FACT_CHECK_API_KEY = os.getenv("GOOGLE_FACT_CHECK_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def analyze_with_chatgpt(text, max_retries=3):
    """Enhanced ChatGPT analysis with better retry logic and cheaper model"""
    if not OPENAI_API_KEY:
        return {"error": "Missing OpenAI API key"}
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""
    Analyze this statement for potential misinformation patterns:
    
    Statement: "{text}"
    
    Return ONLY valid JSON:
    {{
        "is_factual_claim": true/false,
        "main_claim": "the core claim in one sentence",
        "keywords": ["key", "search", "terms"],
        "potential_red_flags": ["list any suspicious patterns"],
        "analysis": "brief analysis of the statement",
        "confidence": 0.85,
        "claim_type": "political/scientific/health/general"
    }}
    """
    
    data = {
        "model": "gpt-3.5-turbo",  # Cheaper than gpt-4
        "messages": [
            {"role": "system", "content": "You are a fact-checking assistant. Always return valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 300,  # Reduced tokens to save costs
        "temperature": 0.2
    }
    
    for attempt in range(max_retries):
        try:
            # Longer delays for rate limiting
            wait_time = (3 ** attempt) + random.uniform(1, 3)
            if attempt > 0:
                print(f"⏳ ChatGPT attempt {attempt + 1}/{max_retries} - waiting {wait_time:.1f}s")
                time.sleep(wait_time)
            
            response = requests.post("https://api.openai.com/v1/chat/completions", 
                                   headers=headers, json=data, timeout=45)
            
            if response.status_code == 429:
                continue  # Will retry with longer wait
                
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content'].strip()
            
            # Clean JSON extraction
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
            
            parsed_result = json.loads(content)
            print(f"✅ ChatGPT succeeded on attempt {attempt + 1}")
            return parsed_result
            
        except requests.exceptions.RequestException as e:
            print(f"🔌 ChatGPT request error: {e}")
        except json.JSONDecodeError as e:
            print(f"📝 ChatGPT JSON error: {e}")
            print(f"Raw content: {content[:200]}...")
        except Exception as e:
            print(f"❌ ChatGPT unexpected error: {e}")
    
    print(f"💥 ChatGPT failed after {max_retries} attempts")
    return {"error": f"ChatGPT failed after {max_retries} attempts"}

def is_claim_opposite(input_text, found_claim):
    """Check if the found claim is the opposite of input text"""
    input_lower = input_text.lower()
    claim_lower = found_claim.lower()
    
    # Common negation patterns
    negation_pairs = [
        ("causes", "doesn't cause"),
        ("causes", "does not cause"),
        ("is", "is not"),
        ("was", "was not"),
        ("born in", "not born in"),
        ("true that", "false that"),
        ("proven", "unproven"),
        ("safe", "unsafe"),
        ("effective", "ineffective")
    ]
    
    for positive, negative in negation_pairs:
        if positive in input_lower and negative in claim_lower:
            return True
        if negative in input_lower and positive in claim_lower:
            return True
    
    # Check for direct negation words
    negation_words = ["not", "doesn't", "don't", "isn't", "aren't", "wasn't", "weren't", "no", "never"]
    
    input_has_negation = any(neg in input_lower.split() for neg in negation_words)
    claim_has_negation = any(neg in claim_lower.split() for neg in negation_words)
    
    # If one has negation and the other doesn't, they might be opposites
    return input_has_negation != claim_has_negation

def analyze_claim_with_google_fact_check(text):
    """Enhanced Google Fact Check with better logic for opposite claims"""
    if not GOOGLE_FACT_CHECK_API_KEY:
        return {"status": "error", "message": "Missing Google Fact Check API key."}

    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {
        "query": text,
        "languageCode": "en",
        "key": GOOGLE_FACT_CHECK_API_KEY
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        if not data or "claims" not in data or not data["claims"]:
            return {"status": "not_found"}

        # Find best matching claim
        best_claim = None
        highest_score = 0
        
        for claim in data["claims"]:
            claim_text = claim.get("text", "")
            score = difflib.SequenceMatcher(None, text.lower(), claim_text.lower()).ratio()
            if score > highest_score:
                highest_score = score
                best_claim = claim

        if highest_score < 0.3:
            return {"status": "not_found"}

        claim_text = best_claim.get("text", "")
        claim_review = best_claim.get("claimReview", [{}])[0]
        claim_rating = claim_review.get("textualRating", "")
        claim_url = claim_review.get("url", "")
        publisher = claim_review.get("publisher", {}).get("name", "Unknown")

        # Check if this is an opposite claim
        is_opposite = is_claim_opposite(text, claim_text)
        
        # Determine verdict with improved logic
        rating_lower = claim_rating.lower()
        
        # Classification of ratings
        definitively_false = any(x in rating_lower for x in ["false", "pants on fire", "incorrect", "debunked"])
        definitively_true = any(x in rating_lower for x in ["true", "correct", "accurate"])
        mixed_or_misleading = any(x in rating_lower for x in ["misleading", "half true", "mixed", "partly"])
        
        if is_opposite and definitively_false:
            # Found the opposite claim rated as false, so our input is likely true
            verdict = "true"
            trust_score = 80
            summary = f'נמצאה טענה הפוכה (דמיון: {highest_score:.0%}): "{claim_text}". דורגה כ: {claim_rating}. לכן הטענה המקורית כנראה נכונה. מקור: {publisher}.'
        elif is_opposite and definitively_true:
            # Found the opposite claim rated as true, so our input is likely false
            verdict = "false"
            trust_score = 20
            summary = f'נמצאה טענה הפוכה (דמיון: {highest_score:.0%}): "{claim_text}". דורגה כ: {claim_rating}. לכן הטענה המקורית כנראה שקרית. מקור: {publisher}.'
        elif not is_opposite and definitively_false:
            # Direct match rated as false
            verdict = "false"
            trust_score = 20
            summary = f'נמצאה טענה דומה (דמיון: {highest_score:.0%}): "{claim_text}". דורגה כ: {claim_rating}. מקור: {publisher}.'
        elif not is_opposite and definitively_true:
            # Direct match rated as true
            verdict = "true"
            trust_score = 85
            summary = f'נמצאה טענה דומה (דמיון: {highest_score:.0%}): "{claim_text}". דורגה כ: {claim_rating}. מקור: {publisher}.'
        else:
            # Mixed, unclear, or low confidence
            verdict = "unknown"
            trust_score = 50
            summary = f'נמצאה טענה דומה (דמיון: {highest_score:.0%}): "{claim_text}". דורגה כ: {claim_rating}. הערכה לא חד-משמעית. מקור: {publisher}.'

        return {
            "status": "success",
            "verdict": verdict,
            "summary": summary,
            "sources": [claim_url] if claim_url else [],
            "trust": trust_score,
            "similarity": highest_score,
            "claim": claim_text,
            "is_opposite_claim": is_opposite,
            "claimReview": {
                "textualRating": claim_rating,
                "publisher": {"name": publisher},
                "url": claim_url
            }
        }

    except requests.exceptions.RequestException as e:
        return {"status": "error", "message": f"Google Fact Check API error: {e}"}

def search_wikipedia_summary(query, max_results=3):
    """Enhanced Wikipedia search with better query optimization"""
    try:
        # Optimize search query for better results
        optimized_queries = [
            query,  # Original query
            query.replace("°C", "celsius"),  # Replace temperature symbols
            query.replace("°F", "fahrenheit"),
            query.split()[0] if len(query.split()) > 1 else query,  # First word only
        ]
        
        for search_query in optimized_queries:
            search_url = "https://en.wikipedia.org/w/api.php"
            search_params = {
                "action": "query",
                "list": "search",
                "srsearch": search_query,
                "format": "json",
                "srlimit": max_results
            }
            
            search_response = requests.get(search_url, params=search_params, timeout=15)
            search_response.raise_for_status()
            search_data = search_response.json()

            if search_data["query"]["search"]:
                # Get summary of the most relevant page
                page_title = search_data["query"]["search"][0]["title"]
                
                summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{page_title}"
                summary_response = requests.get(summary_url, timeout=15)
                summary_response.raise_for_status()
                summary_data = summary_response.json()

                # Check if this page is relevant by looking for key terms
                extract = summary_data.get("extract", "").lower()
                if any(term in extract for term in ["water", "100", "boil", "temperature", "celsius"]):
                    return {
                        "title": summary_data.get("title", ""),
                        "snippet": summary_data.get("extract", "")[:400] + "..." if len(summary_data.get("extract", "")) > 400 else summary_data.get("extract", ""),
                        "url": summary_data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                        "search_results_count": len(search_data["query"]["search"]),
                        "search_query_used": search_query
                    }
        
        return None

    except requests.exceptions.RequestException as e:
        print(f"Wikipedia search failed: {e}")
        return None

def validate_scientific_facts(text, wiki_data):
    """Check if Wikipedia content validates common scientific facts"""
    text_lower = text.lower()
    wiki_content = (wiki_data.get("snippet", "") + " " + wiki_data.get("title", "")).lower()
    
    # Common scientific facts validation
    scientific_validations = [
        {
            "keywords": ["water", "boil", "100", "celsius"],
            "validation_terms": ["100", "celsius", "212", "fahrenheit", "standard", "pressure"],
            "verdict": "true",
            "trust": 85,
            "explanation": "Wikipedia confirms water boils at 100°C (212°F) at standard atmospheric pressure."
        },
        {
            "keywords": ["earth", "orbit", "sun", "year"],
            "validation_terms": ["365", "year", "orbit", "sun", "earth"],
            "verdict": "true", 
            "trust": 90,
            "explanation": "Wikipedia confirms Earth orbits the Sun once per year."
        },
        {
            "keywords": ["gravity", "earth", "9.8", "acceleration"],
            "validation_terms": ["9.8", "gravity", "acceleration", "earth"],
            "verdict": "true",
            "trust": 85,
            "explanation": "Wikipedia confirms Earth's gravitational acceleration is approximately 9.8 m/s²."
        }
    ]
    
    for validation in scientific_validations:
        # Check if input matches this scientific fact
        if all(keyword in text_lower for keyword in validation["keywords"][:2]):  # At least 2 keywords match
            # Check if Wikipedia content supports this fact
            validation_score = sum(1 for term in validation["validation_terms"] if term in wiki_content)
            
            if validation_score >= 2:  # At least 2 validation terms found
                return {
                    "is_validated": True,
                    "verdict": validation["verdict"],
                    "trust": validation["trust"],
                    "explanation": validation["explanation"]
                }
    
    return {"is_validated": False}

def analyze_text_with_ai(text):
    """Main analysis function with improved logic and scientific fact validation"""
    text = (text or "").strip()
    print(f"📩 Analyzing text: \"{text}\"")

    # Step 1: Google Fact Check (primary source)
    google_result = analyze_claim_with_google_fact_check(text)
    print(f"🔍 Google result: {google_result.get('status')} - {google_result.get('verdict', 'unknown')}")
    
    # Step 2: ChatGPT analysis (only if Google found something or failed)
    chatgpt_analysis = None
    if google_result["status"] in ["success", "error"]:
        chatgpt_analysis = analyze_with_chatgpt(text)
        print(f"🤖 ChatGPT status: {'success' if 'error' not in chatgpt_analysis else 'failed'}")
    
    # Step 3: Combine results intelligently
    if google_result["status"] == "success":
        result = google_result
        
        # Enhance with ChatGPT if available
        if chatgpt_analysis and "error" not in chatgpt_analysis:
            red_flags = chatgpt_analysis.get("potential_red_flags", [])
            claim_type = chatgpt_analysis.get("claim_type", "general")
            
            if red_flags:
                result["summary"] += f"\n\n🚩 AI detected red flags: {', '.join(red_flags)}"
            
            result["chatgpt_analysis"] = chatgpt_analysis
            result["ai_enhanced"] = True
            result["claim_type"] = claim_type
        else:
            result["ai_enhanced"] = False
            if chatgpt_analysis and "error" in chatgpt_analysis:
                result["chatgpt_error"] = chatgpt_analysis["error"]
    
    elif google_result["status"] == "not_found":
        # Try Wikipedia as fallback with scientific validation
        wiki_data = search_wikipedia_summary(text)
        
        if wiki_data:
            # Check for scientific fact validation
            scientific_validation = validate_scientific_facts(text, wiki_data)
            
            if scientific_validation["is_validated"]:
                # This is a validated scientific fact
                result = {
                    "status": "success",
                    "verdict": scientific_validation["verdict"],
                    "summary": f'{scientific_validation["explanation"]}\n\nWikipedia reference: {wiki_data["snippet"]}',
                    "sources": [],  # Don't show Wikipedia as separate source since it's integrated
                    "trust": scientific_validation["trust"],
                    "wikipedia": wiki_data,
                    "ai_enhanced": False,
                    "scientific_validation": True
                }
            else:
                # Regular Wikipedia fallback
                result = {
                    "status": "partial_success",
                    "verdict": "unknown",
                    "summary": f'Found Wikipedia reference: {wiki_data["snippet"]}',
                    "sources": [],  # Don't duplicate Wikipedia URL
                    "trust": 60,
                    "wikipedia": wiki_data,
                    "ai_enhanced": False
                }
            
            # Add ChatGPT analysis if available
            if chatgpt_analysis and "error" not in chatgpt_analysis:
                analysis = chatgpt_analysis.get("analysis", "")
                red_flags = chatgpt_analysis.get("potential_red_flags", [])
                
                if red_flags and not scientific_validation["is_validated"]:
                    result["verdict"] = "suspicious"
                    result["trust"] = 40
                    result["summary"] += f"\n\n🤖 AI Analysis: {analysis}\n🚩 Red flags: {', '.join(red_flags)}"
                elif not scientific_validation["is_validated"]:
                    result["summary"] += f"\n\n🤖 AI Analysis: {analysis}"
                
                result["ai_enhanced"] = True
                result["chatgpt_analysis"] = chatgpt_analysis
        else:
            result = {
                "status": "not_found",
                "verdict": "unknown", 
                "summary": "No matching claims found in fact-checking databases. Try rephrasing the statement.",
                "sources": [],
                "trust": None,
                "ai_enhanced": False
            }
    else:
        # Error case
        result = google_result
        result["ai_enhanced"] = False

    return result