import { isValidApiKey, logger } from './shared-config';
import { generateTeachingAid } from './teaching-aids-agent';
import { generateLessonPlan } from './lesson-plan-agent';
import { generateAssessment } from './assessment-agent';
import { translateContent, getSupportedLanguages } from './multilingual-agent';
import { generateStory } from './storyteller-agent';
import { analyzeImage } from './image-analysis-agent';
import { 
  TeachingAidRequest, 
  LessonPlanRequest, 
  AssessmentRequest, 
  TranslationRequest, 
  StoryRequest 
} from './shared-config';

export class GeminiService {
  async healthCheck(): Promise<any> {
    return {
      status: "healthy",
      gemini_configured: isValidApiKey,
      service: "AI Saathi Gemini Service",
      version: "2.0.0",
      agents: ["teaching_aids", "lesson_plan", "assessment", "multilingual", "storyteller", "image_analysis"]
    };
  }

  async createTeachingAid(request: TeachingAidRequest): Promise<any> {
    /**Generate teaching aid using Teaching Aids Agent*/
    try {
      logger.info(`Teaching Aids Agent: Generating ${request.type} for ${request.subject} - ${request.topic}`);
      const result = await generateTeachingAid(request);
      logger.info(`Teaching Aids Agent: Successfully generated ${request.type} for ${request.topic}`);
      return result;
    } catch (error) {
      logger.error(`Teaching Aids Agent Error: ${error}`);
      throw new Error(`Teaching Aids Agent Error: ${error}`);
    }
  }

  async createLessonPlan(request: LessonPlanRequest): Promise<any> {
    /**Generate lesson plan using Lesson Plan Agent*/
    try {
      logger.info(`Lesson Plan Agent: Generating plan for ${request.subject} - ${request.topic}`);
      const result = await generateLessonPlan(request);
      logger.info(`Lesson Plan Agent: Successfully generated plan for ${request.topic}`);
      return result;
    } catch (error) {
      logger.error(`Lesson Plan Agent Error: ${error}`);
      throw new Error(`Lesson Plan Agent Error: ${error}`);
    }
  }

  async createAssessment(request: AssessmentRequest): Promise<any> {
    /**Generate assessment using Assessment Agent*/
    try {
      logger.info(`Assessment Agent: Generating assessment for ${request.subject} - ${request.topic}`);
      const result = await generateAssessment(request);
      logger.info(`Assessment Agent: Successfully generated assessment for ${request.topic}`);
      return result;
    } catch (error) {
      logger.error(`Assessment Agent Error: ${error}`);
      throw new Error(`Assessment Agent Error: ${error}`);
    }
  }

  async translateText(request: TranslationRequest): Promise<any> {
    /**Translate content using Multilingual Agent*/
    try {
      logger.info(`Multilingual Agent: Translating from ${request.fromLanguage} to ${request.toLanguage}`);
      const result = await translateContent(request);
      logger.info(`Multilingual Agent: Successfully translated text`);
      return result;
    } catch (error) {
      logger.error(`Multilingual Agent Error: ${error}`);
      throw new Error(`Multilingual Agent Error: ${error}`);
    }
  }

  async createStory(request: StoryRequest): Promise<any> {
    /**Generate story using Storyteller Agent*/
    try {
      logger.info(`Storyteller Agent: Generating story about ${request.theme}`);
      const result = await generateStory(request);
      logger.info(`Storyteller Agent: Successfully generated story about ${request.theme}`);
      return result;
    } catch (error) {
      logger.error(`Storyteller Agent Error: ${error}`);
      throw new Error(`Storyteller Agent Error: ${error}`);
    }
  }

  async analyzeImageEndpoint(imageData: string): Promise<any> {
    /**Analyze image for educational content using Image Analysis Agent*/
    try {
      logger.info("Image Analysis Agent: Analyzing image for educational content");
      const result = await analyzeImage(imageData);
      logger.info("Image Analysis Agent: Successfully analyzed image");
      return result;
    } catch (error) {
      logger.error(`Image Analysis Agent Error: ${error}`);
      throw new Error(`Image Analysis Agent Error: ${error}`);
    }
  }

  getSupportedLanguages(): string[] {
    return getSupportedLanguages();
  }
}

export const geminiService = new GeminiService(); 