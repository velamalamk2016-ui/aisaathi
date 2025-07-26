"""
Lesson Plan Agent - Creates comprehensive lesson plans for multi-grade classrooms
"""
import json
from typing import Dict, List, Any
from shared_config import (
    model, is_valid_api_key, logger, LessonPlanRequest, 
    parse_gemini_response, genai_types
)

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
        prompt = f"""Create a comprehensive lesson plan for {request.subject} covering grades {'-'.join(map(str, request.grades))} for {request.timeLimit} minutes on "{request.topic}" in {request.language} language. Use these materials: {', '.join(request.materials)}.

Design it for a multi-grade Indian classroom with students of different ages learning together. Include activities that can be adapted for different skill levels.

**Requirements:**
1. Culturally relevant for Indian students (use Indian names, examples, festivals, food)
2. Low-resource classroom friendly (use specified materials creatively)
3. Multi-sensory learning approach
4. Clear Hindi/English language mix as appropriate
5. Include differentiated activities for different grades
6. Real-world connections to Indian rural life

**Output Format (JSON):**
{{
  "title": "Engaging lesson title",
  "objective": "Clear learning objectives",
  "timeBreakdown": [
    {{
      "activity": "Activity name",
      "duration": minutes,
      "grades": [grades],
      "description": "detailed activity description",
      "materials": ["materials for this activity"],
      "instructions": "step-by-step instructions"
    }}
  ],
  "materials": ["all materials needed"],
  "instructions": "Overall teaching instructions",
  "adaptations": "How to adapt for different grades and learning styles",
  "assessmentStrategies": ["ways to assess student understanding"],
  "culturalConnections": "Indian cultural elements and real-world connections",
  "extensions": ["follow-up activities", "homework ideas"],
  "safetyConsiderations": "any safety notes for activities",
  "inclusivityNotes": "adaptations for students with different needs"
}}

Make it practical and immediately usable by teachers in Indian rural classrooms!"""

        response = model.generate_content(
            prompt,
            generation_config=genai_types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2048,
            )
        )
        
        result = parse_gemini_response(response.text)
        
        # Add metadata
        result["aiGenerated"] = True
        result["model"] = "gemini-1.5-pro-latest"
        
        logger.info(f"Successfully generated lesson plan for {request.topic}")
        return result
        
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