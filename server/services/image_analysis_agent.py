"""
Image Analysis Agent - VLM-powered worksheet evaluation and image analysis
"""
import json
import base64
from typing import Dict, List, Any
from shared_config import (
    model, is_valid_api_key, logger, parse_gemini_response
)

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
        
        prompt = """Analyze this image for educational purposes. Provide a comprehensive analysis suitable for Indian educational context.

**Requirements:**
1. Identify all visible objects, people, or scenes
2. Suggest educational concepts that could be taught
3. Provide age-appropriate questions for different grade levels
4. Include cultural context relevant to Indian education
5. Suggest hands-on activities based on the image

**Output Format (JSON):**
{
  "description": "detailed description of the image",
  "elements": ["list of key elements visible"],
  "educationalConcepts": ["concepts that can be taught"],
  "gradeLevel": "suggested grade levels for this content",
  "subjectAreas": ["subjects this image relates to"],
  "discussionQuestions": {
    "beginner": ["questions for younger students"],
    "intermediate": ["questions for middle grade students"],
    "advanced": ["questions for older students"]
  },
  "activities": ["hands-on activities inspired by this image"],
  "culturalContext": "relevance to Indian culture/education",
  "vocabularyWords": ["new words students can learn"],
  "realWorldConnections": ["how this relates to students' daily lives"],
  "assessmentIdeas": ["ways to assess student understanding"],
  "materialsSuggested": ["materials needed for related activities"]
}

Provide rich educational insights that teachers can immediately use!"""

        # Create image part for Gemini
        image_part = {
            "mime_type": "image/jpeg",  # Assume JPEG, adjust as needed
            "data": image_bytes
        }
        
        response = model.generate_content([prompt, image_part])
        
        result = parse_gemini_response(response.text)
        
        # Add metadata
        result["aiGenerated"] = True
        result["model"] = "gemini-1.5-pro-latest"
        result["analysisType"] = "educational_image_analysis"
        
        logger.info("Successfully analyzed image for educational content")
        return result
        
    except Exception as error:
        logger.error(f"Gemini Vision API Error: {error}")
        return {
            "description": "Image analysis failed",
            "elements": [],
            "educational_value": f"Analysis failed due to error: {error}",
            "note": f"Image analysis error: {error}"
        }