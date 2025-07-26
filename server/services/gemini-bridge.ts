// Bridge service to connect Node.js backend with Python Gemini service
import axios from 'axios';

const GEMINI_SERVICE_URL = 'http://localhost:8000';

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

class GeminiBridge {
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${GEMINI_SERVICE_URL}${endpoint}`, data, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Gemini API Error for ${endpoint}:`, errorMessage);
      // Return fallback content if Gemini service is unavailable
      return this.getFallbackContent(endpoint, data);
    }
  }

  private getFallbackContent(endpoint: string, data: any): any {
    switch (endpoint) {
      case '/api/teaching-aid':
        return {
          title: `${data.subject} ${data.type} - ${data.topic}`,
          content: `Sample ${data.type} content for ${data.topic} in ${data.language}`,
          instructions: `Step-by-step instructions using ${data.materials?.join(", ") || 'available materials'}`,
          materials: data.materials || [],
          culturalContext: "Culturally relevant for Indian students",
          note: "Demo content - Gemini service unavailable"
        };
      case '/api/lesson-plan':
        return {
          title: `${data.subject} Lesson Plan - ${data.topic}`,
          objective: `Students will learn about ${data.topic}`,
          timeBreakdown: [
            { activity: "Introduction", duration: 5, grades: data.grades },
            { activity: "Main Activity", duration: data.timeLimit - 15, grades: data.grades },
            { activity: "Wrap-up", duration: 10, grades: data.grades }
          ],
          materials: data.materials || [],
          instructions: "Multi-grade teaching instructions",
          adaptations: "Adaptable for different skill levels",
          note: "Demo content - Gemini service unavailable"
        };
      case '/api/assessment':
        return {
          title: `${data.subject} Assessment - ${data.topic}`,
          questions: Array.from({ length: data.questionCount || 5 }, (_, i) => ({
            question: `Sample question ${i + 1} about ${data.topic}`,
            type: "multiple-choice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            explanation: "Sample explanation"
          })),
          instructions: "Assessment instructions",
          note: "Demo content - Gemini service unavailable"
        };
      case '/api/translate':
        return {
          originalText: data.text,
          translatedText: `[TRANSLATED FROM ${data.fromLanguage.toUpperCase()} TO ${data.toLanguage.toUpperCase()}] ${data.text}`,
          fromLanguage: data.fromLanguage,
          toLanguage: data.toLanguage,
          note: "Demo translation - Gemini service unavailable"
        };
      case '/api/story':
        return {
          title: `Story about ${data.theme}`,
          content: `A story about ${data.theme} featuring ${data.characters?.join(", ") || 'characters'} that teaches: ${data.moral}`,
          moral: data.moral,
          characters: data.characters || [],
          activities: ["Discussion questions", "Role-play activity"],
          note: "Demo content - Gemini service unavailable"
        };
      default:
        return { error: "Unknown endpoint", note: "Fallback content" };
    }
  }

  async generateTeachingAid(request: TeachingAidRequest): Promise<any> {
    return this.makeRequest('/api/teaching-aid', request);
  }

  async generateLessonPlan(request: LessonPlanRequest): Promise<any> {
    return this.makeRequest('/api/lesson-plan', request);
  }

  async generateAssessment(request: AssessmentRequest): Promise<any> {
    return this.makeRequest('/api/assessment', request);
  }

  async translateContent(request: TranslationRequest): Promise<any> {
    return this.makeRequest('/api/translate', request);
  }

  async generateStory(request: StoryRequest): Promise<any> {
    return this.makeRequest('/api/story', request);
  }

  async analyzeImage(imageData: string): Promise<any> {
    return this.makeRequest('/api/analyze-image', { image_data: imageData });
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await axios.get(`${GEMINI_SERVICE_URL}/health`, { timeout: 5000 });
      return response.data;
    } catch (error) {
      return { 
        status: "unavailable", 
        gemini_configured: false, 
        service: "Gemini service not accessible",
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const geminiBridge = new GeminiBridge();