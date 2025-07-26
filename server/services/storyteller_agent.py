"""
Storyteller Agent - Creates educational stories with moral lessons
"""
import json
from typing import Dict, List, Any
from shared_config import (
    model, is_valid_api_key, logger, StoryRequest, 
    parse_gemini_response, genai_types
)

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
        prompt = f"""Create an engaging educational story for grades {'-'.join(map(str, request.grades))} in {request.language} language about {request.theme}.

Include these characters: {', '.join(request.characters)}
Moral lesson: {request.moral}

Make it culturally relevant for Indian children with familiar settings and situations.

**Requirements:**
1. Culturally relevant for Indian students (Indian names, festivals, food, traditions)
2. Age-appropriate language and concepts
3. Clear moral message woven naturally into the story
4. Interactive elements for classroom engagement
5. Real-world connections to Indian rural/urban life
6. Include discussion points and activities

**Output Format (JSON):**
{{
  "title": "Engaging story title",
  "content": "Complete story text with dialogue and descriptions",
  "moral": "clear moral lesson",
  "characters": ["character names and brief descriptions"],
  "setting": "detailed story setting",
  "keyEvents": ["main events in the story"],
  "vocabularyWords": ["new words students will learn"],
  "discussionQuestions": ["thought-provoking questions for students"],
  "activities": ["follow-up activities for students"],
  "culturalContext": "Indian cultural elements included",
  "readingLevel": "appropriate reading level",
  "timeToRead": "estimated reading time",
  "extensionActivities": ["creative projects based on the story"],
  "crossCurricularConnections": ["how this connects to other subjects"],
  "parentEngagement": "how parents can extend learning at home"
}}

Create a rich, engaging story that students will remember and learn from!"""

        response = model.generate_content(
            prompt,
            generation_config=genai_types.GenerationConfig(
                temperature=0.8,
                max_output_tokens=3072,
            )
        )
        
        result = parse_gemini_response(response.text)
        
        # Add metadata
        result["aiGenerated"] = True
        result["model"] = "gemini-1.5-pro-latest"
        
        logger.info(f"Successfully generated story for theme: {request.theme}")
        return result
        
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