import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Configure logging
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`)
};

// Configure Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
logger.info(`Gemini API Key: ${geminiApiKey ? geminiApiKey.substring(0, 8) + '...' : 'Not found'}`);

const isValidApiKey = geminiApiKey && geminiApiKey.length > 20;
logger.info(`Is valid API key: ${isValidApiKey}`);

// Configure Gemini
let model: any = null;
if (isValidApiKey) {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  // Use Gemini 1.5 Pro for enhanced performance
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
}

// Request Models using Zod for validation
export const TeachingAidRequestSchema = z.object({
  subject: z.string(),
  grade: z.number(),
  topic: z.string(),
  language: z.string(),
  materials: z.array(z.string()),
  type: z.enum(['worksheet', 'flashcard', 'story'])
});

export const LessonPlanRequestSchema = z.object({
  subject: z.string(),
  grades: z.array(z.number()),
  timeLimit: z.number(),
  topic: z.string(),
  language: z.string(),
  materials: z.array(z.string())
});

export const AssessmentRequestSchema = z.object({
  subject: z.string(),
  grade: z.number(),
  topic: z.string(),
  language: z.string(),
  questionCount: z.number()
});

export const TranslationRequestSchema = z.object({
  text: z.string(),
  fromLanguage: z.string(),
  toLanguage: z.string()
});

export const StoryRequestSchema = z.object({
  theme: z.string(),
  grades: z.array(z.number()),
  language: z.string(),
  moral: z.string(),
  characters: z.array(z.string())
});

export type TeachingAidRequest = z.infer<typeof TeachingAidRequestSchema>;
export type LessonPlanRequest = z.infer<typeof LessonPlanRequestSchema>;
export type AssessmentRequest = z.infer<typeof AssessmentRequestSchema>;
export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;
export type StoryRequest = z.infer<typeof StoryRequestSchema>;

export function parseGeminiResponse(content: string): any {
  /**Parse Gemini response, handling markdown formatting*/
  content = content.trim();
  if (content.startsWith('```json')) {
    content = content.replace('```json', '').replace('```', '').trim();
  } else if (content.startsWith('```')) {
    content = content.substring(3, content.length - 3).trim();
  }
  
  try {
    return JSON.parse(content);
  } catch (error) {
    logger.error(`Failed to parse Gemini response: ${error}`);
    return { error: 'Failed to parse response', rawContent: content };
  }
}

export { model, isValidApiKey, logger }; 