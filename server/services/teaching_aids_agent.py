"""
Teaching Aids Agent - Generates worksheets, flashcards, and visual learning materials
"""
import json
from typing import Dict, List, Any
from shared_config import (
    model, is_valid_api_key, logger, TeachingAidRequest, 
    parse_gemini_response, genai_types
)

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
    """Enhanced teaching aid generation with Gemini"""
    
    # Check if we can generate with Gemini
    if not is_valid_api_key or not model:
        mock_result = generate_mock_teaching_aid(request)
        mock_result["note"] = "This is demo content. Configure a valid Gemini API key to generate real teaching aids."
        return mock_result
    
    try:
        # Build comprehensive prompt for Gemini
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
        
        # Generate content with Gemini
        response = model.generate_content(
            prompt,
            generation_config=genai_types.GenerationConfig(
                temperature=0.8,
                max_output_tokens=3000,
            )
        )
        content = response.text
        
        # Parse JSON response
        try:
            result = parse_gemini_response(content)
            
            # Add metadata
            result["aiGenerated"] = True
            result["model"] = "gemini-1.5-pro-latest"
            result["timestamp"] = str(json.loads(json.dumps(request.dict(), default=str)))
            
            # Add SVG elements if it's a visual aid
            if request.type == "flashcard" and any(visual in request.topic.lower() for visual in ['shape', 'number', 'math', 'गणित']):
                result["flashcards"] = generate_topic_specific_flashcards(request)
            
            logger.info(f"Successfully generated teaching aid with Gemini for {request.topic}")
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
                "model": "gemini-1.5-pro-latest",
                "rawResponse": True
            }
    
    except Exception as error:
        logger.error(f"Gemini API Error, falling back to demo content: {error}")
        mock_result = generate_mock_teaching_aid(request)
        mock_result["note"] = f"Demo content with topic-specific visuals. Gemini API error: {str(error)}"
        return mock_result