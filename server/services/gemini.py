"""
AI Saathi Gemini Service - Main orchestrator for all AI agents
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import all agents
from shared_config import (
    TeachingAidRequest, LessonPlanRequest, AssessmentRequest, 
    TranslationRequest, StoryRequest, is_valid_api_key, logger
)
from teaching_aids_agent import generate_teaching_aid
from lesson_plan_agent import generate_lesson_plan
from assessment_agent import generate_assessment
from multilingual_agent import translate_content
from storyteller_agent import generate_story
from image_analysis_agent import analyze_image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app for serving the API
app = FastAPI(title="AI Saathi Gemini Service", version="2.0.0")

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
    return {"message": "AI Saathi Gemini 2.0 Service with Modular Agents is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "gemini_configured": is_valid_api_key,
        "service": "AI Saathi Gemini Service",
        "version": "2.0.0",
        "agents": ["teaching_aids", "lesson_plan", "assessment", "multilingual", "storyteller", "image_analysis"]
    }

# Teaching Aids Agent Endpoint
@app.post("/api/teaching-aid")
async def create_teaching_aid(request: TeachingAidRequest):
    """Generate teaching aid using Teaching Aids Agent"""
    try:
        logger.info(f"Teaching Aids Agent: Generating {request.type} for {request.subject} - {request.topic}")
        result = await generate_teaching_aid(request)
        logger.info(f"Teaching Aids Agent: Successfully generated {request.type} for {request.topic}")
        return result
    except Exception as e:
        logger.error(f"Teaching Aids Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Lesson Plan Agent Endpoint
@app.post("/api/lesson-plan")
async def create_lesson_plan(request: LessonPlanRequest):
    """Generate lesson plan using Lesson Plan Agent"""
    try:
        logger.info(f"Lesson Plan Agent: Generating plan for {request.subject} - {request.topic}")
        result = await generate_lesson_plan(request)
        logger.info(f"Lesson Plan Agent: Successfully generated plan for {request.topic}")
        return result
    except Exception as e:
        logger.error(f"Lesson Plan Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Assessment Agent Endpoint
@app.post("/api/assessment")
async def create_assessment(request: AssessmentRequest):
    """Generate assessment using Assessment Agent"""
    try:
        logger.info(f"Assessment Agent: Generating assessment for {request.subject} - {request.topic}")
        result = await generate_assessment(request)
        logger.info(f"Assessment Agent: Successfully generated assessment for {request.topic}")
        return result
    except Exception as e:
        logger.error(f"Assessment Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Multilingual Agent Endpoint
@app.post("/api/translate")
async def translate_text(request: TranslationRequest):
    """Translate content using Multilingual Agent"""
    try:
        logger.info(f"Multilingual Agent: Translating from {request.fromLanguage} to {request.toLanguage}")
        result = await translate_content(request)
        logger.info(f"Multilingual Agent: Successfully translated text")
        return result
    except Exception as e:
        logger.error(f"Multilingual Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Storyteller Agent Endpoint
@app.post("/api/story")
async def create_story(request: StoryRequest):
    """Generate story using Storyteller Agent"""
    try:
        logger.info(f"Storyteller Agent: Generating story about {request.theme}")
        result = await generate_story(request)
        logger.info(f"Storyteller Agent: Successfully generated story about {request.theme}")
        return result
    except Exception as e:
        logger.error(f"Storyteller Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Image Analysis Agent Endpoint
@app.post("/api/analyze-image")
async def analyze_image_endpoint(request: dict):
    """Analyze image for educational content using Image Analysis Agent"""
    try:
        logger.info("Image Analysis Agent: Analyzing image for educational content")
        image_data = request.get("image_data", "")
        result = await analyze_image(image_data)
        logger.info("Image Analysis Agent: Successfully analyzed image")
        return result
    except Exception as e:
        logger.error(f"Image Analysis Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)