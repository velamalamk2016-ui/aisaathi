import google.generativeai as genai
import json
import os
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import logging
import base64

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
    # Use Gemini 2.0 Flash for enhanced performance
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

def generate_shape_svg(shape: str) -> str:
    """Generate SVG for basic shapes"""
    if shape == "circle":
        return """<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#ffeb3b" stroke="#ff9800" stroke-width="4"/>
        <g transform="translate(100,100)">
          <line x1="0" y1="-100" x2="0" y2="-85" stroke="#ff9800" stroke-width="3"/>
          <line x1="71" y1="-71" x2="60" y2="-60" stroke="#ff9800" stroke-width="3"/>
          <line x1="100" y1="0" x2="85" y2="0" stroke="#ff9800" stroke-width="3"/>
          <line x1="71" y1="71" x2="60" y2="60" stroke="#ff9800" stroke-width="3"/>
          <line x1="0" y1="100" x2="0" y2="85" stroke="#ff9800" stroke-width="3"/>
          <line x1="-71" y1="71" x2="-60" y2="60" stroke="#ff9800" stroke-width="3"/>
          <line x1="-100" y1="0" x2="-85" y2="0" stroke="#ff9800" stroke-width="3"/>
          <line x1="-71" y1="-71" x2="-60" y2="-60" stroke="#ff9800" stroke-width="3"/>
        </g>
      </svg>"""
    elif shape == "triangle":
        return """<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <polygon points="100,20 30,160 170,160" fill="#4caf50" stroke="#2e7d32" stroke-width="4"/>
        <polygon points="80,140 120,140 100,100" fill="#81c784" stroke="#2e7d32" stroke-width="2"/>
      </svg>"""
    elif shape == "square":
        return """<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="140" height="140" fill="#2196f3" stroke="#1565c0" stroke-width="4"/>
        <rect x="60" y="60" width="35" height="35" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
        <rect x="105" y="60" width="35" height="35" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
        <rect x="60" y="105" width="80" height="30" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
      </svg>"""
    else:
        return """<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="50" width="100" height="100" fill="#e0e0e0" stroke="#666" stroke-width="2"/>
      </svg>"""

def generate_apples_svg(count1: int, count2: int) -> str:
    """Generate SVG showing apples for addition"""
    if count2 == 0:
        apple_svg = ""
        for i in range(count1):
            apple_svg += f'<circle cx="{50 + i * 40}" cy="75" r="25" fill="#ff6b6b" stroke="#333" stroke-width="2"/>'
            apple_svg += f'<ellipse cx="{50 + i * 40}" cy="55" rx="3" ry="8" fill="#4ecdc4"/>'
        return f'<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">{apple_svg}</svg>'
    else:
        apple_svg = ""
        for i in range(count1):
            apple_svg += f'<circle cx="{30 + i * 30}" cy="75" r="20" fill="#ff6b6b" stroke="#333" stroke-width="2"/>'
            apple_svg += f'<ellipse cx="{30 + i * 30}" cy="60" rx="2" ry="6" fill="#4ecdc4"/>'
        apple_svg += '<text x="150" y="85" font-family="Arial" font-size="30" fill="#333" text-anchor="middle">+</text>'
        for i in range(count2):
            apple_svg += f'<circle cx="{190 + i * 30}" cy="75" r="20" fill="#ff6b6b" stroke="#333" stroke-width="2"/>'
            apple_svg += f'<ellipse cx="{190 + i * 30}" cy="60" rx="2" ry="6" fill="#4ecdc4"/>'
        return f'<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">{apple_svg}</svg>'

def generate_topic_specific_flashcards(request: TeachingAidRequest) -> List[Dict[str, Any]]:
    """Generate topic-specific flashcards with visual content"""
    topic = request.topic.lower()
    subject = request.subject.lower()
    
    # Math topics
    if 'math' in subject or 'गणित' in subject:
        if 'shape' in topic or 'आकार' in topic:
            return [
                {
                    "frontImage": generate_shape_svg("circle"),
                    "backImage": generate_shape_svg("circle"),
                    "frontText": "Circle",
                    "backText": "वृत्त",
                    "imageType": "svg",
                    "realWorldExample": "Sun, orange, wheel, clock face"
                },
                {
                    "frontImage": generate_shape_svg("triangle"),
                    "backImage": generate_shape_svg("triangle"),
                    "frontText": "Triangle",
                    "backText": "त्रिकोण",
                    "imageType": "svg",
                    "realWorldExample": "Mountain, samosa, tent, roof"
                },
                {
                    "frontImage": generate_shape_svg("square"),
                    "backImage": generate_shape_svg("square"),
                    "frontText": "Square",
                    "backText": "वर्ग",
                    "imageType": "svg",
                    "realWorldExample": "House window, book, tile, box"
                }
            ]
        
        if 'addition' in topic or 'जोड़' in topic or 'add' in topic:
            return [
                {
                    "frontImage": generate_apples_svg(2, 3),
                    "backImage": generate_apples_svg(5, 0),
                    "frontText": "2 + 3",
                    "backText": "5",
                    "imageType": "svg",
                    "realWorldExample": "Count and add real fruits"
                },
                {
                    "frontImage": generate_apples_svg(1, 4),
                    "backImage": generate_apples_svg(5, 0),
                    "frontText": "1 + 4",
                    "backText": "5",
                    "imageType": "svg",
                    "realWorldExample": "Use real objects to count"
                }
            ]
    
    # Science topics
    if 'science' in subject or 'विज्ञान' in subject:
        if 'plant' in topic or 'पौधे' in topic:
            return [
                {
                    "frontImage": "<svg>Plant stem and leaves</svg>",
                    "backImage": "<svg>Plant parts labeled</svg>",
                    "frontText": "Plant",
                    "backText": "पौधा",
                    "imageType": "svg",
                    "realWorldExample": "Real plants in garden or pots"
                }
            ]
    
    # Default flashcards
    return [
        {
            "frontImage": f"<svg>Visual for {topic}</svg>",
            "backImage": f"<svg>Answer for {topic}</svg>",
            "frontText": topic.title(),
            "backText": f"Demo content for {topic}",
            "imageType": "svg",
            "realWorldExample": f"Real world examples of {topic}"
        }
    ]

def generate_mock_teaching_aid(request: TeachingAidRequest) -> Dict[str, Any]:
    """Generate mock teaching aid content"""
    if request.type == "flashcard":
        flashcards = generate_topic_specific_flashcards(request)
        return {
            "title": f"{request.subject} Image Flashcards - {request.topic}",
            "content": f"Pure image-based flashcard set for {request.topic} using real photos and pictures",
            "flashcards": flashcards,
            "instructions": f"Collect or take real photos for these flashcards using {', '.join(request.materials)}. Print photos on cardboard (10cm x 15cm) or paste them onto cards.",
            "materials": request.materials + ["printed photos", "camera/phone", "glue", "cardboard"],
            "culturalContext": "All images use familiar Indian objects and real-world examples students see daily",
            "imageCollection": "Photos of real objects, situations, and examples from student's environment",
            "note": "Image-based content using real photos and pictures."
        }
    
    return {
        "title": f"{request.subject} {request.type} - {request.topic}",
        "content": f"Sample {request.type} content for {request.topic} in {request.language}",
        "instructions": f"Step-by-step instructions for using {', '.join(request.materials)} to teach {request.topic}",
        "materials": request.materials,
        "culturalContext": "Sample cultural context for Indian students",
        "note": "This is demo content. Configure a valid Gemini API key to generate real content."
    }

async def generate_teaching_aid(request: TeachingAidRequest) -> Dict[str, Any]:
    """Enhanced teaching aid generation with Gemini 2.0"""
    
    # Check if we can generate with Gemini
    if not is_valid_api_key or not model:
        mock_result = generate_mock_teaching_aid(request)
        mock_result["note"] = "This is demo content. Configure a valid Gemini API key to generate real teaching aids."
        return mock_result
    
    try:
        # Build comprehensive prompt for Gemini 2.0
        prompt = f"""
        You are an expert Indian educator creating teaching materials for rural multi-grade classrooms. 
        Create a comprehensive {request.type} for:
        
        **Context:**
        - Subject: {request.subject}
        - Grade: {request.grade}
        - Topic: {request.topic}
        - Language: {request.language}
        - Available Materials: {', '.join(request.materials)}
        - Type: {request.type}
        
        **Requirements:**
        1. Culturally relevant for Indian students (use Indian names, examples, festivals, food)
        2. Low-resource classroom friendly (use specified materials creatively)
        3. Multi-sensory learning approach
        4. Clear Hindi/English language mix as appropriate
        5. Include visual SVG elements if applicable
        6. Real-world connections to Indian rural life
        
        **Output Format (JSON):**
        {{
          "title": "Creative title for the teaching aid",
          "description": "Brief description of what this teaches",
          "content": "Rich detailed content with examples and explanations",
          "instructions": "Clear step-by-step instructions for teachers",
          "materials": {request.materials},
          "culturalContext": "How this connects to Indian culture and daily life",
          "assessmentCriteria": ["criteria1", "criteria2", "criteria3"],
          "variations": ["variation for visual learners", "variation for kinesthetic learners"],
          "timeRequired": "estimated time",
          "visualElements": ["description of visual elements to include"],
          "extensions": ["how to extend the lesson", "additional activities"],
          "localConnections": "Connections to local Indian context, festivals, traditions"
        }}
        
        Make it engaging, practical, and immediately usable by teachers!
        """
        
        # Generate content with Gemini 2.0
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.8,
                max_output_tokens=3000,
            )
        )
        content = response.text
        
        # Parse JSON response
        try:
            # Clean response - remove markdown formatting if present
            content = content.strip()
            if content.startswith('```json'):
                content = content.replace('```json', '').replace('```', '').strip()
            
            result = json.loads(content)
            
            # Add metadata
            result["aiGenerated"] = True
            result["model"] = "gemini-2.0-flash-exp"
            result["timestamp"] = str(json.loads(json.dumps(request.dict(), default=str)))
            
            # Add SVG elements if it's a visual aid
            if request.type == "flashcard" and any(visual in request.topic.lower() for visual in ['shape', 'number', 'math', 'गणित']):
                result["flashcards"] = generate_topic_specific_flashcards(request)
            
            logger.info(f"Successfully generated teaching aid with Gemini 2.0 for {request.topic}")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            # Return structured response with AI content
            return {
                "title": f"{request.subject} {request.type.title()} - {request.topic}",
                "description": f"AI-generated {request.type} for {request.topic}",
                "content": content,  # Raw AI response
                "instructions": "Follow the detailed content above",
                "materials": request.materials,
                "culturalContext": "Designed for Indian classroom context",
                "aiGenerated": True,
                "model": "gemini-2.0-flash-exp",
                "rawResponse": True
            }
    
    except Exception as error:
        logger.error(f"Gemini 2.0 API Error, falling back to demo content: {error}")
        mock_result = generate_mock_teaching_aid(request)
        mock_result["note"] = f"Demo content with topic-specific visuals. Gemini API error: {str(error)}"
        return mock_result

async def generate_lesson_plan(request: LessonPlanRequest) -> Dict[str, Any]:
    """Generate lesson plan using Gemini API"""
    if not model:
        return {
            "title": f"{request.subject} Lesson Plan - {request.topic}",
            "objective": f"Students will learn about {request.topic} through hands-on activities",
            "timeBreakdown": [
                {"activity": "Introduction", "duration": 5, "grades": request.grades},
                {"activity": "Main Activity", "duration": request.timeLimit - 15, "grades": request.grades},
                {"activity": "Wrap-up", "duration": 10, "grades": request.grades}
            ],
            "materials": request.materials,
            "instructions": "Detailed instructions for multi-grade teaching",
            "adaptations": "Activities can be adapted for different skill levels",
            "note": "This is demo content. Configure a valid Gemini API key to generate real lesson plans."
        }
    
    try:
        prompt = f"""Create a lesson plan for {request.subject} covering grades {'-'.join(map(str, request.grades))} for {request.timeLimit} minutes on "{request.topic}" in {request.language} language. Use these materials: {', '.join(request.materials)}.

Design it for a multi-grade Indian classroom with students of different ages learning together. Include activities that can be adapted for different skill levels.

Respond in JSON format:
{{
  "title": "Lesson title",
  "objective": "Learning objectives",
  "timeBreakdown": [{{"activity": "Activity name", "duration": minutes, "grades": [grades]}}],
  "materials": ["materials needed"],
  "instructions": "Detailed instructions",
  "adaptations": "How to adapt for different grades"
}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2048,
            )
        )
        
        content = response.text.strip()
        if content.startswith('```json'):
            content = content[7:-3]
        elif content.startswith('```'):
            content = content[3:-3]
        
        return json.loads(content)
        
    except Exception as error:
        logger.error(f"Gemini API Error: {error}")
        return {
            "title": f"{request.subject} Lesson Plan - {request.topic}",
            "objective": f"Students will learn about {request.topic} through hands-on activities",
            "timeBreakdown": [
                {"activity": "Introduction", "duration": 5, "grades": request.grades},
                {"activity": "Main Activity", "duration": request.timeLimit - 15, "grades": request.grades},
                {"activity": "Wrap-up", "duration": 10, "grades": request.grades}
            ],
            "materials": request.materials,
            "instructions": "Detailed instructions for multi-grade teaching",
            "adaptations": "Activities can be adapted for different skill levels",
            "note": f"Demo content due to API error: {error}"
        }

async def generate_assessment(request: AssessmentRequest) -> Dict[str, Any]:
    """Generate assessment using Gemini API"""
    if not model:
        return {
            "title": f"{request.subject} Assessment - {request.topic}",
            "questions": [
                {
                    "question": f"Sample question {i + 1} about {request.topic}",
                    "type": "multiple-choice",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "Option A",
                    "explanation": "Sample explanation for correct answer"
                }
                for i in range(request.questionCount)
            ],
            "instructions": "Instructions for conducting the assessment",
            "note": "This is demo content. Configure a valid Gemini API key to generate real assessments."
        }
    
    try:
        prompt = f"""Create {request.questionCount} assessment questions for {request.subject} grade {request.grade} on "{request.topic}" in {request.language} language.

Make questions appropriate for Indian students and include both verbal and written components. Consider different learning styles.

Respond in JSON format:
{{
  "title": "Assessment title",
  "questions": [
    {{
      "question": "Question text",
      "type": "multiple-choice|short-answer|verbal",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct answer",
      "explanation": "explanation for correct answer"
    }}
  ],
  "instructions": "Instructions for conducting assessment"
}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2048,
            )
        )
        
        content = response.text.strip()
        if content.startswith('```json'):
            content = content[7:-3]
        elif content.startswith('```'):
            content = content[3:-3]
        
        return json.loads(content)
        
    except Exception as error:
        logger.error(f"Gemini API Error: {error}")
        return {
            "title": f"{request.subject} Assessment - {request.topic}",
            "questions": [
                {
                    "question": f"Sample question {i + 1} about {request.topic}",
                    "type": "multiple-choice",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "Option A",
                    "explanation": "Sample explanation for correct answer"
                }
                for i in range(request.questionCount)
            ],
            "instructions": "Instructions for conducting the assessment",
            "note": f"Demo content due to API error: {error}"
        }

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

Text to translate: "{request.text}"

Respond in JSON format:
{{
  "originalText": "original text",
  "translatedText": "translated text",
  "fromLanguage": "source language",
  "toLanguage": "target language",
  "culturalNotes": "any cultural adaptation notes if relevant"
}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=1024,
            )
        )
        
        content = response.text.strip()
        if content.startswith('```json'):
            content = content[7:-3]
        elif content.startswith('```'):
            content = content[3:-3]
        
        return json.loads(content)
        
    except Exception as error:
        logger.error(f"Gemini API Error: {error}")
        return {
            "originalText": request.text,
            "translatedText": f"[TRANSLATION ERROR] {request.text}",
            "fromLanguage": request.fromLanguage,
            "toLanguage": request.toLanguage,
            "note": f"Translation failed due to API error: {error}"
        }

async def generate_story(request: StoryRequest) -> Dict[str, Any]:
    """Generate story using Gemini API"""
    if not model:
        return {
            "title": f"Story about {request.theme}",
            "content": f"A sample story about {request.theme} with characters {', '.join(request.characters)} that teaches the moral: {request.moral}",
            "moral": request.moral,
            "characters": request.characters,
            "activities": ["Discussion questions", "Role-play activity", "Art activity"],
            "note": "This is demo content. Configure a valid Gemini API key to generate real stories."
        }
    
    try:
        prompt = f"""Create an educational story for grades {'-'.join(map(str, request.grades))} in {request.language} language about {request.theme}.

Include these characters: {', '.join(request.characters)}
Moral lesson: {request.moral}

Make it culturally relevant for Indian children with familiar settings and situations.

Respond in JSON format:
{{
  "title": "Story title",
  "content": "Complete story text",
  "moral": "moral lesson",
  "characters": ["character names"],
  "setting": "story setting",
  "activities": ["follow-up activities for students"],
  "discussion": ["discussion questions"],
  "culturalContext": "Indian cultural elements included"
}}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.8,
                max_output_tokens=3072,
            )
        )
        
        content = response.text.strip()
        if content.startswith('```json'):
            content = content[7:-3]
        elif content.startswith('```'):
            content = content[3:-3]
        
        return json.loads(content)
        
    except Exception as error:
        logger.error(f"Gemini API Error: {error}")
        return {
            "title": f"Story about {request.theme}",
            "content": f"A sample story about {request.theme} with characters {', '.join(request.characters)} that teaches the moral: {request.moral}",
            "moral": request.moral,
            "characters": request.characters,
            "activities": ["Discussion questions", "Role-play activity", "Art activity"],
            "note": f"Demo content due to API error: {error}"
        }

# Image analysis function (similar to OpenAI's vision capabilities)
async def analyze_image(image_data: str) -> Dict[str, Any]:
    """Analyze image using Gemini Vision"""
    if not model:
        return {
            "description": "Image analysis requires valid Gemini API key",
            "elements": [],
            "educational_value": "Cannot analyze without API access"
        }
    
    try:
        # Decode base64 image if provided
        if image_data.startswith('data:image'):
            header, data = image_data.split(',', 1)
            image_bytes = base64.b64decode(data)
        else:
            image_bytes = base64.b64decode(image_data)
        
        prompt = """Analyze this image for educational purposes. Describe:
1. What objects, people, or scenes are visible
2. Educational concepts that could be taught using this image
3. Age-appropriate questions teachers could ask about this image
4. Cultural context if relevant to Indian education

Respond in JSON format:
{
  "description": "detailed description of the image",
  "elements": ["list of key elements visible"],
  "educational_concepts": ["concepts that can be taught"],
  "discussion_questions": ["questions for students"],
  "cultural_context": "relevance to Indian culture/education"
}"""

        # Create image part for Gemini
        image_part = {
            "mime_type": "image/jpeg",  # Assume JPEG, adjust as needed
            "data": image_bytes
        }
        
        response = model.generate_content([prompt, image_part])
        
        content = response.text.strip()
        if content.startswith('```json'):
            content = content[7:-3]
        elif content.startswith('```'):
            content = content[3:-3]
        
        return json.loads(content)
        
    except Exception as error:
        logger.error(f"Gemini Vision API Error: {error}")
        return {
            "description": "Image analysis failed",
            "elements": [],
            "educational_value": f"Analysis failed due to error: {error}"
        }

# FastAPI app for serving the API
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Saathi Gemini Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/teaching-aid")
async def create_teaching_aid(request: TeachingAidRequest):
    """Generate teaching aid"""
    try:
        result = await generate_teaching_aid(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/lesson-plan")
async def create_lesson_plan(request: LessonPlanRequest):
    """Generate lesson plan"""
    try:
        result = await generate_lesson_plan(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/assessment")
async def create_assessment(request: AssessmentRequest):
    """Generate assessment"""
    try:
        result = await generate_assessment(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/translate")
async def translate_text(request: TranslationRequest):
    """Translate content"""
    try:
        result = await translate_content(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/story")
async def create_story(request: StoryRequest):
    """Generate story"""
    try:
        result = await generate_story(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-image")
async def analyze_image_endpoint(image_data: str):
    """Analyze image for educational content"""
    try:
        result = await analyze_image(image_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "gemini_configured": is_valid_api_key,
        "service": "AI Saathi Gemini Service"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)