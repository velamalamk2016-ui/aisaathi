"""
Assessment Agent - Creates comprehensive assessments with instant feedback
"""
import json
from typing import Dict, List, Any
from shared_config import (
    model, is_valid_api_key, logger, AssessmentRequest, 
    parse_gemini_response, genai_types
)

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
        prompt = f"""Create {request.questionCount} comprehensive assessment questions for {request.subject} grade {request.grade} on "{request.topic}" in {request.language} language.

Make questions appropriate for Indian students and include both verbal and written components. Consider different learning styles and cultural context.

**Requirements:**
1. Culturally relevant for Indian students (use Indian names, examples, festivals, food)
2. Mix of question types (multiple choice, short answer, verbal, practical)
3. Clear Hindi/English language mix as appropriate
4. Include visual/practical questions where possible
5. Real-world connections to Indian rural life
6. Immediate feedback and explanations

**Output Format (JSON):**
{{
  "title": "Assessment title",
  "description": "Brief description of the assessment",
  "questions": [
    {{
      "question": "Question text",
      "type": "multiple-choice|short-answer|verbal|practical",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct answer",
      "explanation": "detailed explanation for correct answer",
      "culturalContext": "Indian context or real-world connection",
      "visualAids": "description of any visual aids needed",
      "gradingCriteria": "how to evaluate the answer"
    }}
  ],
  "instructions": "Instructions for conducting assessment",
  "timeRequired": "estimated time",
  "materials": ["materials needed for assessment"],
  "adaptations": "modifications for different learning needs",
  "scoringGuide": "how to score and interpret results",
  "followUpActivities": ["activities based on assessment results"]
}}

Make it comprehensive and culturally appropriate for Indian classrooms!"""

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
        
        logger.info(f"Successfully generated assessment for {request.topic}")
        return result
        
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