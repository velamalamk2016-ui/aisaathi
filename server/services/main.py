from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from shared_config import (
    TeachingAidRequest, LessonPlanRequest, AssessmentRequest, 
    TranslationRequest, StoryRequest, is_valid_api_key
)
from teaching_aids_agent import generate_teaching_aid
from lesson_plan_agent import generate_lesson_plan
from assessment_agent import generate_assessment
from multilingual_agent import translate_content
from storyteller_agent import generate_story
from image_analysis_agent import analyze_image
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Saathi - Modular Gemini Service", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Saathi Modular Gemini 2.0 Service is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "gemini_configured": is_valid_api_key,
        "service": "modular-gemini-2.0", 
        "version": "2.0.0",
        "agents": ["teaching_aids", "lesson_plan", "assessment", "multilingual", "storyteller", "image_analysis"]
    }

@app.post("/api/teaching-aid")
async def create_teaching_aid(request: TeachingAidRequest):
    """Generate teaching aid using Teaching Aids Agent"""
    try:
        logger.info(f"Generating teaching aid for: {request.subject} - {request.topic}")
        result = await generate_teaching_aid(request)
        logger.info(f"Successfully generated teaching aid for: {request.topic}")
        return result
    except Exception as e:
        logger.error(f"Error generating teaching aid: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/lesson-plan")
async def create_lesson_plan(request: LessonPlanRequest):
    """Generate lesson plan using Lesson Plan Agent"""
    try:
        logger.info(f"Generating lesson plan for: {request.subject} - {request.topic}")
        result = await generate_lesson_plan(request)
        return result
    except Exception as e:
        logger.error(f"Error generating lesson plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/assessment")
async def create_assessment(request: AssessmentRequest):
    """Generate assessment using Assessment Agent"""
    try:
        logger.info(f"Generating assessment for: {request.subject} - {request.topic}")
        result = await generate_assessment(request)
        return result
    except Exception as e:
        logger.error(f"Error generating assessment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate")
async def translate(request: TranslationRequest):
    """Translate text using Multilingual Agent"""
    try:
        logger.info(f"Translating from {request.fromLanguage} to {request.toLanguage}")
        result = await translate_content(request)
        return result
    except Exception as e:
        logger.error(f"Error translating text: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/story")
async def create_story(request: StoryRequest):
    """Generate story using Storyteller Agent"""
    try:
        logger.info(f"Generating story with theme: {request.theme}")
        result = await generate_story(request)
        return result
    except Exception as e:
        logger.error(f"Error generating story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-image")
async def analyze_image_endpoint(request: dict):
    """Analyze image for educational content using Image Analysis Agent"""
    try:
        logger.info("Analyzing image for educational content")
        image_data = request.get("image_data", "")
        result = await analyze_image(image_data)
        return result
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )