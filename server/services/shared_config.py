"""
Shared configuration and models for AI Saathi agent services
"""
import google.generativeai as genai
from google.generativeai import types as genai_types
import json
import os
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
gemini_api_key = os.getenv('GEMINI_API_KEY')
logger.info(f"Gemini API Key: {gemini_api_key[:8] + '...' if gemini_api_key else 'Not found'}")

is_valid_api_key = gemini_api_key and len(gemini_api_key) > 20
logger.info(f"Is valid API key: {is_valid_api_key}")

# Configure Gemini
if is_valid_api_key:
    genai.configure(api_key=gemini_api_key)
    # Use Gemini 1.5 Pro for enhanced performance
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
else:
    model = None

# Request Models
class TeachingAidRequest(BaseModel):
    subject: str
    grade: int
    topic: str
    language: str
    materials: List[str]
    type: str  # "worksheet" | "flashcard" | "story"

class LessonPlanRequest(BaseModel):
    subject: str
    grades: List[int]
    timeLimit: int
    topic: str
    language: str
    materials: List[str]

class AssessmentRequest(BaseModel):
    subject: str
    grade: int
    topic: str
    language: str
    questionCount: int

class TranslationRequest(BaseModel):
    text: str
    fromLanguage: str
    toLanguage: str

class StoryRequest(BaseModel):
    theme: str
    grades: List[int]
    language: str
    moral: str
    characters: List[str]

def parse_gemini_response(content: str) -> Dict[str, Any]:
    """Parse Gemini response, handling markdown formatting"""
    content = content.strip()
    if content.startswith('```json'):
        content = content.replace('```json', '').replace('```', '').strip()
    elif content.startswith('```'):
        content = content[3:-3].strip()
    
    return json.loads(content)