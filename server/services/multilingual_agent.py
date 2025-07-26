"""
Multilingual Agent - Provides content translation across supported languages
"""
import json
from typing import Dict, List, Any
from shared_config import (
    model, is_valid_api_key, logger, TranslationRequest, 
    parse_gemini_response, genai_types
)

async def translate_content(request: TranslationRequest) -> Dict[str, Any]:
    """Translate content using Gemini API"""
    if not model:
        return {
            "originalText": request.text,
            "translatedText": f"[TRANSLATED FROM {request.fromLanguage.upper()} TO {request.toLanguage.upper()}] {request.text}",
            "fromLanguage": request.fromLanguage,
            "toLanguage": request.toLanguage,
            "note": "This is demo content. Configure a valid Gemini API key for real translations."
        }
    
    try:
        prompt = f"""Translate the following text from {request.fromLanguage} to {request.toLanguage}. 
        
Provide accurate, culturally appropriate translation suitable for Indian educational context.

**Requirements:**
1. Maintain educational meaning and context
2. Use appropriate cultural references for Indian students
3. Preserve technical terms where appropriate
4. Include pronunciation guide if helpful
5. Note any cultural adaptations made

Text to translate: "{request.text}"

**Output Format (JSON):**
{{
  "originalText": "original text",
  "translatedText": "accurately translated text",
  "fromLanguage": "source language",
  "toLanguage": "target language",
  "culturalNotes": "any cultural adaptation notes if relevant",
  "pronunciationGuide": "pronunciation help if needed",
  "alternativeTranslations": ["alternative ways to express the same meaning"],
  "contextualUsage": "when and how to use this translation in educational settings",
  "difficulty": "language difficulty level for students"
}}

Ensure the translation is natural and appropriate for Indian educational context!"""

        response = model.generate_content(
            prompt,
            generation_config=genai_types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=1024,
            )
        )
        
        result = parse_gemini_response(response.text)
        
        # Add metadata
        result["aiGenerated"] = True
        result["model"] = "gemini-1.5-pro-latest"
        
        logger.info(f"Successfully translated from {request.fromLanguage} to {request.toLanguage}")
        return result
        
    except Exception as error:
        logger.error(f"Gemini API Error: {error}")
        return {
            "originalText": request.text,
            "translatedText": f"[TRANSLATION ERROR] {request.text}",
            "fromLanguage": request.fromLanguage,
            "toLanguage": request.toLanguage,
            "note": f"Translation failed due to API error: {error}"
        }