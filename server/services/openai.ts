import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY;
console.log("OpenAI API Key:", apiKey ? apiKey.substring(0, 8) + "..." : "Not found");
const isValidApiKey = apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;
console.log("Is valid API key:", isValidApiKey);

// If we still have the placeholder key, force use of real API to test
const forceRealAPI = apiKey && apiKey !== "5993";

const openai = (isValidApiKey || forceRealAPI) ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
}) : null;

export interface TeachingAidRequest {
  subject: string;
  grade: number;
  topic: string;
  language: string;
  materials: string[];
  type: "worksheet" | "flashcard" | "story";
}

export interface LessonPlanRequest {
  subject: string;
  grades: number[];
  timeLimit: number;
  topic: string;
  language: string;
  materials: string[];
}

export interface AssessmentRequest {
  subject: string;
  grade: number;
  topic: string;
  language: string;
  questionCount: number;
}

export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
}

export interface StoryRequest {
  theme: string;
  grades: number[];
  language: string;
  moral: string;
  characters: string[];
}

export async function generateTeachingAid(request: TeachingAidRequest): Promise<any> {
  if (!openai) {
    return generateMockTeachingAid(request);
  }

  try {
    let prompt = "";
    
    if (request.type === "flashcard") {
      prompt = `Create ${request.type}s for ${request.subject} class ${request.grade} students on the topic "${request.topic}" in ${request.language} language. Use these available materials: ${request.materials.join(", ")}. 

      Create PURE IMAGE-BASED flashcards where each card shows actual pictures/images instead of text. The flashcards should be primarily visual with minimal text.

      For each flashcard, provide:
      - Actual image content (what picture/photo/drawing goes on each side)
      - Visual-only learning without text explanations
      - Real pictures students can look at and recognize
      - Image-based questions and answers

      Respond in JSON format with the following structure:
      {
        "title": "Title of the flashcard set",
        "content": "Description of the flashcard set",
        "flashcards": [
          {
            "frontImage": "Exact description of the image/picture for front side",
            "backImage": "Exact description of the image/picture for back side", 
            "frontText": "Minimal text (1-3 words max)",
            "backText": "Minimal text (1-3 words max)",
            "imageType": "photo/drawing/symbol",
            "realWorldExample": "What real object/photo this represents"
          }
        ],
        "instructions": "Instructions for finding/creating the actual images",
        "materials": ["materials needed including image sources"],
        "culturalContext": "Indian cultural context for images",
        "imageCollection": "List of specific images/photos needed"
      }`;
    } else {
      prompt = `Create a ${request.type} for ${request.subject} class ${request.grade} students on the topic "${request.topic}" in ${request.language} language. Use these available materials: ${request.materials.join(", ")}. 

      Make it culturally relevant for Indian students and include instructions for using local materials like cardboard, clay, leaves, or plastic bottles.

      Respond in JSON format with the following structure:
      {
        "title": "Title of the teaching aid",
        "content": "Main content/questions",
        "instructions": "Step-by-step instructions",
        "materials": ["list of materials needed"],
        "culturalContext": "How it relates to Indian culture/context"
      }`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Indian educator who creates culturally relevant teaching materials using local resources."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error: any) {
    console.log("OpenAI API Error, falling back to demo content:", error.message);
    const mockResult = generateMockTeachingAid(request);
    mockResult.note = `Demo content with topic-specific visuals. API quota exceeded.`;
    return mockResult;
  }
}

function generateMockTeachingAid(request: TeachingAidRequest): any {
  // Remove debug logging
  
  if (request.type === "flashcard") {
    // Generate topic-specific visual flashcards
    const flashcards = generateTopicSpecificFlashcards(request);
    // Enhanced visual flashcards generated
    
    return {
      title: `${request.subject} Image Flashcards - ${request.topic}`,
      content: `Pure image-based flashcard set for ${request.topic} using real photos and pictures`,
      flashcards: flashcards,
      instructions: `Collect or take real photos for these flashcards using ${request.materials.join(", ")}. Print photos on cardboard (10cm x 15cm) or paste them onto cards. Use actual objects and real images instead of drawings.`,
      materials: [...request.materials, "printed photos", "camera/phone", "glue", "cardboard"],
      culturalContext: "All images use familiar Indian objects and real-world examples students see daily",
      imageCollection: "Photos of real objects, situations, and examples from student's environment",
      note: "Image-based content using real photos and pictures."
    };
  }
  
  return {
    title: `${request.subject} ${request.type} - ${request.topic}`,
    content: `Sample ${request.type} content for ${request.topic} in ${request.language}`,
    instructions: `Step-by-step instructions for using ${request.materials.join(", ")} to teach ${request.topic}`,
    materials: request.materials,
    culturalContext: "Sample cultural context for Indian students",
    note: "This is demo content."
  };
}

function generateTopicSpecificFlashcards(request: TeachingAidRequest) {
  const topic = request.topic.toLowerCase();
  const subject = request.subject.toLowerCase();
  // Generate topic-specific visual content
  
  // Math topics
  if (subject.includes('math') || subject.includes('गणित')) {
    if (topic.includes('shape') || topic.includes('आकार')) {
      return [
        {
          frontImage: generateShapeSVG("circle"),
          backImage: generateShapeExamplesSVG("circle"),
          frontText: "Circle",
          backText: "वृत्त", 
          imageType: "svg",
          realWorldExample: "Sun, orange, wheel, clock face"
        },
        {
          frontImage: generateShapeSVG("triangle"),
          backImage: generateShapeExamplesSVG("triangle"),
          frontText: "Triangle", 
          backText: "त्रिकोण",
          imageType: "svg",
          realWorldExample: "Mountain, samosa, tent, roof"
        },
        {
          frontImage: generateShapeSVG("square"),
          backImage: generateShapeExamplesSVG("square"),
          frontText: "Square",
          backText: "वर्ग", 
          imageType: "svg",
          realWorldExample: "House window, book, tile, box"
        }
      ];
    }
    
    if (topic.includes('addition') || topic.includes('जोड़') || topic.includes('summation') || topic.includes('add')) {
      return [
        {
          frontImage: generateApplesSVG(2, 3),
          backImage: generateApplesSVG(5, 0),
          frontText: "2 + 3",
          backText: "5",
          imageType: "svg",
          realWorldExample: "Count and add real fruits"
        },
        {
          frontImage: generateHandsSVG(3, 2),
          backImage: generateHandsSVG(5, 0),
          frontText: "3 + 2", 
          backText: "5",
          imageType: "svg",
          realWorldExample: "Use your own hands to count"
        },
        {
          frontImage: generateToysSVG(1, 4, "car"),
          backImage: generateToysSVG(5, 0, "car"),
          frontText: "1 + 4",
          backText: "5", 
          imageType: "svg",
          realWorldExample: "Use real toys or objects"
        }
      ];
    }
  }
  
  // Science topics
  if (subject.includes('science') || subject.includes('विज्ञान')) {
    if (topic.includes('plant') || topic.includes('पौधे')) {
      return [
        {
          frontImage: generatePlantSVG(),
          backImage: generatePlantPartsSVG(),
          frontText: "Plant",
          backText: "Parts",
          imageType: "svg",
          realWorldExample: "Real marigold or tulsi plant with flowers"
        },
        {
          frontImage: generatePlantNeedsSVG(),
          backImage: generatePlantCareSVG(),
          frontText: "Needs?",
          backText: "Sun, Water",
          imageType: "svg", 
          realWorldExample: "Garden plants, potted plants, watering can"
        }
      ];
    }
  }
  
  // Default image-based flashcards for any topic
  return [
    {
      frontImage: `Photo or clear image representing ${request.topic} concept`,
      backImage: `Collection of real-world examples showing ${request.topic}`,
      frontText: request.topic,
      backText: "Examples",
      imageType: "photo",
      realWorldExample: `Real objects, photos, or situations showing ${request.topic}`
    },
    {
      frontImage: `Photo of students/people using ${request.topic} in daily life`,
      backImage: `Step-by-step photos showing ${request.topic} in action`,
      frontText: "Daily Use",
      backText: "How To",
      imageType: "photo",
      realWorldExample: `Real situations where ${request.topic} is used`
    }
  ];
}

// SVG generation functions for visual flashcards
function generateApplesSVG(count1: number, count2: number): string {
  if (count2 === 0) {
    // Single group of apples
    return `<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
      ${Array.from({length: count1}, (_, i) => `
        <circle cx="${50 + i * 40}" cy="75" r="25" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
        <ellipse cx="${50 + i * 40}" cy="55" rx="3" ry="8" fill="#4ecdc4"/>
      `).join('')}
    </svg>`;
  } else {
    // Two groups with + sign
    return `<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
      ${Array.from({length: count1}, (_, i) => `
        <circle cx="${30 + i * 30}" cy="75" r="20" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
        <ellipse cx="${30 + i * 30}" cy="60" rx="2" ry="6" fill="#4ecdc4"/>
      `).join('')}
      <text x="150" y="85" font-family="Arial" font-size="30" fill="#333" text-anchor="middle">+</text>
      ${Array.from({length: count2}, (_, i) => `
        <circle cx="${190 + i * 30}" cy="75" r="20" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
        <ellipse cx="${190 + i * 30}" cy="60" rx="2" ry="6" fill="#4ecdc4"/>
      `).join('')}
    </svg>`;
  }
}

function generateHandsSVG(fingers1: number, fingers2: number): string {
  if (fingers2 === 0) {
    // Single hand showing all fingers
    return `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="100" y="120" width="100" height="60" rx="30" fill="#fdbcb4" stroke="#333" stroke-width="2"/>
      ${Array.from({length: fingers1}, (_, i) => `
        <rect x="${110 + i * 15}" y="80" width="12" height="50" rx="6" fill="#fdbcb4" stroke="#333" stroke-width="1"/>
      `).join('')}
    </svg>`;
  } else {
    // Two hands
    return `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="120" width="80" height="50" rx="25" fill="#fdbcb4" stroke="#333" stroke-width="2"/>
      ${Array.from({length: fingers1}, (_, i) => `
        <rect x="${35 + i * 12}" y="90" width="10" height="40" rx="5" fill="#fdbcb4" stroke="#333" stroke-width="1"/>
      `).join('')}
      <text x="150" y="100" font-family="Arial" font-size="24" fill="#333" text-anchor="middle">+</text>
      <rect x="190" y="120" width="80" height="50" rx="25" fill="#fdbcb4" stroke="#333" stroke-width="2"/>
      ${Array.from({length: fingers2}, (_, i) => `
        <rect x="${195 + i * 12}" y="90" width="10" height="40" rx="5" fill="#fdbcb4" stroke="#333" stroke-width="1"/>
      `).join('')}
    </svg>`;
  }
}

function generateToysSVG(count1: number, count2: number, toy: string): string {
  if (count2 === 0) {
    // Single row of toys
    return `<svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
      ${Array.from({length: count1}, (_, i) => `
        <rect x="${40 + i * 45}" y="30" width="35" height="20" rx="3" fill="#4ecdc4" stroke="#333" stroke-width="2"/>
        <circle cx="${45 + i * 45}" cy="60" r="8" fill="#333"/>
        <circle cx="${70 + i * 45}" cy="60" r="8" fill="#333"/>
      `).join('')}
    </svg>`;
  } else {
    // Two groups of toys
    return `<svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
      ${Array.from({length: count1}, (_, i) => `
        <rect x="${20 + i * 35}" y="30" width="30" height="18" rx="3" fill="#4ecdc4" stroke="#333" stroke-width="2"/>
        <circle cx="${23 + i * 35}" cy="55" r="6" fill="#333"/>
        <circle cx="${47 + i * 35}" cy="55" r="6" fill="#333"/>
      `).join('')}
      <text x="150" y="50" font-family="Arial" font-size="20" fill="#333" text-anchor="middle">+</text>
      ${Array.from({length: count2}, (_, i) => `
        <rect x="${180 + i * 35}" y="30" width="30" height="18" rx="3" fill="#4ecdc4" stroke="#333" stroke-width="2"/>
        <circle cx="${183 + i * 35}" cy="55" r="6" fill="#333"/>
        <circle cx="${207 + i * 35}" cy="55" r="6" fill="#333"/>
      `).join('')}
    </svg>`;
  }
}

function generateShapeSVG(shape: string): string {
  switch(shape) {
    case "circle":
      return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#ffeb3b" stroke="#ff9800" stroke-width="4"/>
        <g transform="translate(100,100)">
          ${Array.from({length: 8}, (_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = Math.cos(angle) * 85;
            const y1 = Math.sin(angle) * 85;
            const x2 = Math.cos(angle) * 100;
            const y2 = Math.sin(angle) * 100;
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ff9800" stroke-width="3"/>`;
          }).join('')}
        </g>
      </svg>`;
    case "triangle":
      return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <polygon points="100,20 30,160 170,160" fill="#4caf50" stroke="#2e7d32" stroke-width="4"/>
        <polygon points="80,140 120,140 100,100" fill="#81c784" stroke="#2e7d32" stroke-width="2"/>
      </svg>`;
    case "square":
      return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="140" height="140" fill="#2196f3" stroke="#1565c0" stroke-width="4"/>
        <rect x="60" y="60" width="35" height="35" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
        <rect x="105" y="60" width="35" height="35" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
        <rect x="60" y="105" width="80" height="30" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
      </svg>`;
    default:
      return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="50" width="100" height="100" fill="#e0e0e0" stroke="#666" stroke-width="2"/>
      </svg>`;
  }
}

function generateShapeExamplesSVG(shape: string): string {
  switch(shape) {
    case "circle":
      return `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="30" fill="#ff9800" stroke="#333" stroke-width="2"/>
        <circle cx="160" cy="60" r="25" fill="#4caf50" stroke="#333" stroke-width="2"/>
        <circle cx="240" cy="60" r="20" fill="#2196f3" stroke="#333" stroke-width="2"/>
        <circle cx="110" cy="140" r="25" fill="#9c27b0" stroke="#333" stroke-width="2"/>
        <circle cx="190" cy="140" r="22" fill="#f44336" stroke="#333" stroke-width="2"/>
      </svg>`;
    case "triangle":
      return `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <polygon points="60,30 30,80 90,80" fill="#4caf50" stroke="#333" stroke-width="2"/>
        <polygon points="160,25 130,85 190,85" fill="#ff9800" stroke="#333" stroke-width="2"/>
        <polygon points="240,35 210,75 270,75" fill="#2196f3" stroke="#333" stroke-width="2"/>
        <polygon points="110,120 80,170 140,170" fill="#9c27b0" stroke="#333" stroke-width="2"/>
        <polygon points="210,125 180,165 240,165" fill="#f44336" stroke="#333" stroke-width="2"/>
      </svg>`;
    case "square":
      return `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="40" height="40" fill="#2196f3" stroke="#333" stroke-width="2"/>
        <rect x="130" y="25" width="45" height="45" fill="#4caf50" stroke="#333" stroke-width="2"/>
        <rect x="220" y="35" width="35" height="35" fill="#ff9800" stroke="#333" stroke-width="2"/>
        <rect x="80" y="120" width="40" height="40" fill="#9c27b0" stroke="#333" stroke-width="2"/>
        <rect x="180" y="125" width="38" height="38" fill="#f44336" stroke="#333" stroke-width="2"/>
      </svg>`;
    default:
      return `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="50" width="100" height="100" fill="#e0e0e0" stroke="#666" stroke-width="2"/>
      </svg>`;
  }
}

function generatePlantSVG(): string {
  return `<svg width="200" height="250" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
    <!-- Roots -->
    <g stroke="#8d6e63" stroke-width="3" fill="none">
      <path d="M100,200 Q80,220 70,235"/>
      <path d="M100,200 Q120,220 130,235"/>
      <path d="M100,200 Q90,225 85,240"/>
      <path d="M100,200 Q110,225 115,240"/>
    </g>
    <!-- Stem -->
    <rect x="95" y="80" width="10" height="120" fill="#4caf50" stroke="#2e7d32" stroke-width="2"/>
    <!-- Leaves -->
    <ellipse cx="70" cy="120" rx="20" ry="12" fill="#66bb6a" stroke="#2e7d32" stroke-width="2"/>
    <ellipse cx="130" cy="140" rx="18" ry="10" fill="#66bb6a" stroke="#2e7d32" stroke-width="2"/>
    <ellipse cx="75" cy="160" rx="22" ry="14" fill="#66bb6a" stroke="#2e7d32" stroke-width="2"/>
    <!-- Flower -->
    <circle cx="100" cy="60" r="20" fill="#e91e63" stroke="#ad1457" stroke-width="2"/>
    <circle cx="100" cy="60" r="8" fill="#ffeb3b"/>
    <!-- Petals -->
    <g transform="translate(100,60)">
      ${Array.from({length: 6}, (_, i) => {
        const angle = (i * 60) * Math.PI / 180;
        const x = Math.cos(angle) * 15;
        const y = Math.sin(angle) * 15;
        return `<circle cx="${x}" cy="${y}" r="6" fill="#f48fb1"/>`;
      }).join('')}
    </g>
  </svg>`;
}

function generatePlantPartsSVG(): string {
  return `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Roots -->
    <g transform="translate(50,50)">
      <path d="M0,0 Q-20,20 -30,35 M0,0 Q20,20 30,35 M0,0 Q-10,25 -15,40 M0,0 Q10,25 15,40" 
            stroke="#8d6e63" stroke-width="3" fill="none"/>
      <text x="0" y="50" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">Roots</text>
    </g>
    <!-- Stem -->
    <g transform="translate(120,50)">
      <rect x="-5" y="0" width="10" height="40" fill="#4caf50" stroke="#2e7d32" stroke-width="2"/>
      <text x="0" y="55" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">Stem</text>
    </g>
    <!-- Leaves -->
    <g transform="translate(190,50)">
      <ellipse cx="0" cy="10" rx="15" ry="8" fill="#66bb6a" stroke="#2e7d32" stroke-width="2"/>
      <ellipse cx="-10" cy="25" rx="12" ry="6" fill="#66bb6a" stroke="#2e7d32" stroke-width="2"/>
      <text x="0" y="50" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">Leaves</text>
    </g>
    <!-- Flower -->
    <g transform="translate(50,130)">
      <circle cx="0" cy="0" r="12" fill="#e91e63" stroke="#ad1457" stroke-width="2"/>
      <circle cx="0" cy="0" r="4" fill="#ffeb3b"/>
      <text x="0" y="25" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">Flower</text>
    </g>
    <!-- Fruit -->
    <g transform="translate(190,130)">
      <ellipse cx="0" cy="0" rx="10" ry="15" fill="#ff9800" stroke="#f57c00" stroke-width="2"/>
      <ellipse cx="0" cy="-12" rx="2" ry="4" fill="#4caf50"/>
      <text x="0" y="25" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">Fruit</text>
    </g>
  </svg>`;
}

function generatePlantNeedsSVG(): string {
  return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Plant -->
    <rect x="95" y="120" width="10" height="60" fill="#4caf50"/>
    <ellipse cx="80" cy="140" rx="15" ry="8" fill="#66bb6a"/>
    <ellipse cx="120" cy="150" rx="12" ry="6" fill="#66bb6a"/>
    <circle cx="100" cy="110" r="12" fill="#e91e63"/>
    <!-- Sun -->
    <circle cx="50" cy="50" r="20" fill="#ffeb3b" stroke="#ff9800" stroke-width="2"/>
    <g transform="translate(50,50)">
      ${Array.from({length: 8}, (_, i) => {
        const angle = (i * 45) * Math.PI / 180;
        const x1 = Math.cos(angle) * 25;
        const y1 = Math.sin(angle) * 25;
        const x2 = Math.cos(angle) * 35;
        const y2 = Math.sin(angle) * 35;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ff9800" stroke-width="2"/>`;
      }).join('')}
    </g>
    <!-- Water drops -->
    <g fill="#2196f3">
      <path d="M150,40 Q145,35 150,30 Q155,35 150,40"/>
      <path d="M165,55 Q160,50 165,45 Q170,50 165,55"/>
      <path d="M135,60 Q130,55 135,50 Q140,55 135,60"/>
    </g>
  </svg>`;
}

function generatePlantCareSVG(): string {
  return `<svg width="300" height="150" viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">
    <!-- Sun -->
    <g transform="translate(60,40)">
      <circle cx="0" cy="0" r="15" fill="#ffeb3b" stroke="#ff9800" stroke-width="2"/>
      <g>
        ${Array.from({length: 8}, (_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const x1 = Math.cos(angle) * 20;
          const y1 = Math.sin(angle) * 20;
          const x2 = Math.cos(angle) * 28;
          const y2 = Math.sin(angle) * 28;
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ff9800" stroke-width="2"/>`;
        }).join('')}
      </g>
      <text x="0" y="45" text-anchor="middle" font-family="Arial" font-size="10" fill="#333">Sun</text>
    </g>
    <!-- Water -->
    <g transform="translate(150,40)">
      <path d="M0,0 Q-5,-5 0,-10 Q5,-5 0,0" fill="#2196f3"/>
      <path d="M-10,5 Q-15,0 -10,-5 Q-5,0 -10,5" fill="#2196f3"/>
      <path d="M10,5 Q5,0 10,-5 Q15,0 10,5" fill="#2196f3"/>
      <text x="0" y="25" text-anchor="middle" font-family="Arial" font-size="10" fill="#333">Water</text>
    </g>
    <!-- Soil -->
    <g transform="translate(240,40)">
      <rect x="-15" y="-5" width="30" height="15" fill="#8d6e63" rx="3"/>
      <circle cx="-8" cy="2" r="2" fill="#5d4037"/>
      <circle cx="8" cy="2" r="2" fill="#5d4037"/>
      <circle cx="0" cy="-2" r="1.5" fill="#5d4037"/>
      <text x="0" y="25" text-anchor="middle" font-family="Arial" font-size="10" fill="#333">Soil</text>
    </g>
  </svg>`;
}

export async function generateLessonPlan(request: LessonPlanRequest): Promise<any> {
  if (!openai) {
    return {
      title: `${request.subject} Lesson Plan - ${request.topic}`,
      objective: `Students will learn about ${request.topic} through hands-on activities`,
      timeBreakdown: [
        { activity: "Introduction", duration: 5, grades: request.grades },
        { activity: "Main Activity", duration: request.timeLimit - 15, grades: request.grades },
        { activity: "Wrap-up", duration: 10, grades: request.grades }
      ],
      materials: request.materials,
      instructions: "Detailed instructions for multi-grade teaching",
      adaptations: "Activities can be adapted for different skill levels",
      note: "This is demo content. Configure a valid OpenAI API key to generate real lesson plans."
    };
  }

  const prompt = `Create a lesson plan for ${request.subject} covering grades ${request.grades.join("-")} for ${request.timeLimit} minutes on "${request.topic}" in ${request.language} language. Use these materials: ${request.materials.join(", ")}.

  Design it for a multi-grade Indian classroom with students of different ages learning together. Include activities that can be adapted for different skill levels.

  Respond in JSON format:
  {
    "title": "Lesson title",
    "objective": "Learning objectives",
    "timeBreakdown": [{"activity": "Activity name", "duration": minutes, "grades": [grades]}],
    "materials": ["materials needed"],
    "instructions": "Detailed instructions",
    "adaptations": "How to adapt for different grades"
  }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert in multi-grade classroom management and Indian pedagogy."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateAssessment(request: AssessmentRequest): Promise<any> {
  if (!openai) {
    return {
      title: `${request.subject} Assessment - ${request.topic}`,
      questions: Array.from({ length: request.questionCount }, (_, i) => ({
        question: `Sample question ${i + 1} about ${request.topic}`,
        type: "multiple-choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "Sample explanation for correct answer"
      })),
      instructions: "Instructions for conducting the assessment",
      note: "This is demo content. Configure a valid OpenAI API key to generate real assessments."
    };
  }

  const prompt = `Create ${request.questionCount} assessment questions for ${request.subject} grade ${request.grade} on "${request.topic}" in ${request.language} language.

  Make questions appropriate for Indian students and include both verbal and written components. Consider different learning styles.

  Respond in JSON format:
  {
    "title": "Assessment title",
    "questions": [
      {
        "question": "Question text",
        "type": "multiple-choice|short-answer|verbal",
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": "correct answer",
        "explanation": "Why this is correct"
      }
    ],
    "instructions": "How to conduct this assessment"
  }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert in educational assessment and Indian curriculum standards."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function translateContent(request: TranslationRequest): Promise<any> {
  if (!openai) {
    return {
      originalText: request.text,
      translatedText: `[${request.toLanguage} translation of: ${request.text}]`,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage,
      culturalNotes: "Demo translation - configure OpenAI API key for real translations",
      note: "This is demo content. Configure a valid OpenAI API key to generate real translations."
    };
  }

  const prompt = `Translate the following text from ${request.fromLanguage} to ${request.toLanguage}, keeping educational context and cultural relevance for Indian students:

  "${request.text}"

  Respond in JSON format:
  {
    "originalText": "Original text",
    "translatedText": "Translated text",
    "fromLanguage": "Source language",
    "toLanguage": "Target language",
    "culturalNotes": "Any cultural adaptations made"
  }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert translator specializing in Indian languages (Hindi, English, Tamil, Telugu, Bengali, Urdu, Marathi, Malayalam, Kannada, Gujarati, Punjabi, Odia) and educational content. Provide culturally appropriate translations that preserve educational context."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateStory(request: StoryRequest): Promise<any> {
  if (!openai) {
    return {
      title: `${request.theme} Story`,
      introduction: `Once upon a time, there were ${request.characters.join(" and ")} who taught us about ${request.moral}...`,
      chapters: [
        {
          content: `Sample story content about ${request.theme} featuring ${request.characters.join(", ")}`,
          choices: [
            { option: "Continue the adventure", consequence: "The story continues..." },
            { option: "Learn the moral", consequence: "They learned about " + request.moral }
          ]
        }
      ],
      moral: request.moral,
      culturalElements: "Sample Indian cultural elements",
      note: "This is demo content. Configure a valid OpenAI API key to generate real stories."
    };
  }

  const prompt = `Create an interactive story with the theme "${request.theme}" for grades ${request.grades.join("-")} in ${request.language} language. Include characters: ${request.characters.join(", ")} and moral: "${request.moral}".

  Make it engaging for Indian children with familiar cultural elements and settings. Include decision points where students can choose what happens next.

  Respond in JSON format:
  {
    "title": "Story title",
    "introduction": "Opening of the story",
    "chapters": [
      {
        "content": "Chapter content",
        "choices": [
          {"option": "Choice text", "consequence": "What happens next"}
        ]
      }
    ],
    "moral": "Story moral",
    "culturalElements": "Indian cultural references included"
  }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a skilled storyteller who creates engaging educational content for Indian children."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}
