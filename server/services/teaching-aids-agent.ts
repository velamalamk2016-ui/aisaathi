import { model, isValidApiKey, logger, TeachingAidRequest, parseGeminiResponse } from './shared-config';

function generateShapeSvg(shape: string): string {
  /**Generate SVG for basic shapes*/
  if (shape === "circle") {
    return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`;
  } else if (shape === "triangle") {
    return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,20 30,160 170,160" fill="#4caf50" stroke="#2e7d32" stroke-width="4"/>
      <polygon points="80,140 120,140 100,100" fill="#81c784" stroke="#2e7d32" stroke-width="2"/>
    </svg>`;
  } else if (shape === "square") {
    return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="30" width="140" height="140" fill="#2196f3" stroke="#1565c0" stroke-width="4"/>
      <rect x="60" y="60" width="35" height="35" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
      <rect x="105" y="60" width="35" height="35" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
      <rect x="60" y="105" width="80" height="30" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
    </svg>`;
  } else {
    return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="50" width="100" height="100" fill="#e0e0e0" stroke="#666" stroke-width="2"/>
    </svg>`;
  }
}

function generateApplesSvg(count1: number, count2: number): string {
  /**Generate SVG showing apples for addition*/
  if (count2 === 0) {
    let appleSvg = "";
    for (let i = 0; i < count1; i++) {
      appleSvg += `<circle cx="${50 + i * 40}" cy="75" r="25" fill="#ff6b6b" stroke="#333" stroke-width="2"/>`;
      appleSvg += `<ellipse cx="${50 + i * 40}" cy="55" rx="3" ry="8" fill="#4ecdc4"/>`;
    }
    return `<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">${appleSvg}</svg>`;
  } else {
    let appleSvg = "";
    for (let i = 0; i < count1; i++) {
      appleSvg += `<circle cx="${30 + i * 30}" cy="75" r="20" fill="#ff6b6b" stroke="#333" stroke-width="2"/>`;
      appleSvg += `<ellipse cx="${30 + i * 30}" cy="60" rx="2" ry="6" fill="#4ecdc4"/>`;
    }
    appleSvg += '<text x="150" y="85" font-family="Arial" font-size="30" fill="#333" text-anchor="middle">+</text>';
    for (let i = 0; i < count2; i++) {
      appleSvg += `<circle cx="${190 + i * 30}" cy="75" r="20" fill="#ff6b6b" stroke="#333" stroke-width="2"/>`;
      appleSvg += `<ellipse cx="${190 + i * 30}" cy="60" rx="2" ry="6" fill="#4ecdc4"/>`;
    }
    return `<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">${appleSvg}</svg>`;
  }
}

function generateTopicSpecificFlashcards(request: TeachingAidRequest): any[] {
  /**Generate topic-specific flashcards with visual content*/
  const topic = request.topic.toLowerCase();
  const subject = request.subject.toLowerCase();
  
  // Math topics
  if (subject.includes('math') || subject.includes('गणित')) {
    if (topic.includes('shape') || topic.includes('आकार')) {
      return [
        {
          frontImage: generateShapeSvg("circle"),
          backImage: generateShapeSvg("circle"),
          frontText: "Circle",
          backText: "वृत्त",
          imageType: "svg",
          realWorldExample: "Sun, orange, wheel, clock face"
        },
        {
          frontImage: generateShapeSvg("triangle"),
          backImage: generateShapeSvg("triangle"),
          frontText: "Triangle",
          backText: "त्रिकोण",
          imageType: "svg",
          realWorldExample: "Mountain, samosa, tent, roof"
        },
        {
          frontImage: generateShapeSvg("square"),
          backImage: generateShapeSvg("square"),
          frontText: "Square",
          backText: "वर्ग",
          imageType: "svg",
          realWorldExample: "House window, book, tile, box"
        }
      ];
    }
    
    if (topic.includes('addition') || topic.includes('जोड़') || topic.includes('add')) {
      return [
        {
          frontImage: generateApplesSvg(3, 2),
          backImage: generateApplesSvg(5, 0),
          frontText: "3 + 2 = ?",
          backText: "5",
          imageType: "svg",
          realWorldExample: "3 apples + 2 apples = 5 apples"
        },
        {
          frontImage: generateApplesSvg(4, 1),
          backImage: generateApplesSvg(5, 0),
          frontText: "4 + 1 = ?",
          backText: "5",
          imageType: "svg",
          realWorldExample: "4 pencils + 1 pencil = 5 pencils"
        }
      ];
    }
  }
  
  // Default flashcards
  return [
    {
      frontText: `${request.topic} - Question 1`,
      backText: `Answer about ${request.topic}`,
      imageType: "text",
      realWorldExample: "Real-world application"
    },
    {
      frontText: `${request.topic} - Question 2`,
      backText: `Another answer about ${request.topic}`,
      imageType: "text",
      realWorldExample: "Practical example"
    }
  ];
}

function generateMockTeachingAid(request: TeachingAidRequest): any {
  /**Generate mock teaching aid when Gemini is not available*/
  const baseContent = {
    title: `${request.subject} ${request.type} - ${request.topic}`,
    instructions: `Step-by-step instructions using ${request.materials?.join(", ") || 'available materials'}`,
    materials: request.materials || [],
    culturalContext: "Culturally relevant for Indian students",
    note: "Demo content - Gemini service unavailable"
  };

  if (request.type === 'flashcard') {
    return {
      ...baseContent,
      flashcards: generateTopicSpecificFlashcards(request)
    };
  } else if (request.type === 'worksheet') {
    return {
      ...baseContent,
      content: `Sample worksheet content for ${request.topic} in ${request.language}`,
      questions: [
        `1. What is ${request.topic}?`,
        `2. Give an example of ${request.topic}`,
        `3. How is ${request.topic} used in daily life?`
      ]
    };
  } else {
    return {
      ...baseContent,
      content: `Sample story content for ${request.topic} in ${request.language}`,
      characters: ["Student", "Teacher", "Helper"],
      plot: `A story about learning ${request.topic}`
    };
  }
}

export async function generateTeachingAid(request: TeachingAidRequest): Promise<any> {
  /**Generate teaching aid using Teaching Aids Agent*/
  try {
    if (!isValidApiKey || !model) {
      logger.warn("Gemini API not configured, using mock content");
      return generateMockTeachingAid(request);
    }

    const prompt = `Generate a ${request.type} for ${request.subject} grade ${request.grade} on topic "${request.topic}" in ${request.language}. 
    
    Available materials: ${request.materials.join(", ")}
    
    Requirements:
    - Age-appropriate for grade ${request.grade}
    - Culturally relevant for Indian students
    - Include step-by-step instructions
    - Make it engaging and interactive
    
    Return the response as a JSON object with the following structure:
    {
      "title": "Title of the ${request.type}",
      "content": "Main content or description",
      "instructions": "Step-by-step instructions",
      "materials": ["list", "of", "materials"],
      "culturalContext": "How it relates to Indian culture",
      ${request.type === 'flashcard' ? '"flashcards": [{"frontText": "", "backText": "", "imageType": "svg/text", "realWorldExample": ""}]' : ''}
      ${request.type === 'worksheet' ? '"questions": ["question1", "question2", "question3"]' : ''}
      ${request.type === 'story' ? '"characters": ["char1", "char2"], "plot": "story plot", "moral": "moral lesson"' : ''}
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsedResponse = parseGeminiResponse(text);
    
    if (parsedResponse.error) {
      logger.error(`Failed to parse Gemini response: ${parsedResponse.error}`);
      return generateMockTeachingAid(request);
    }
    
    return {
      ...parsedResponse,
      materials: request.materials,
      culturalContext: parsedResponse.culturalContext || "Culturally relevant for Indian students"
    };
    
  } catch (error) {
    logger.error(`Teaching Aids Agent Error: ${error}`);
    return generateMockTeachingAid(request);
  }
} 