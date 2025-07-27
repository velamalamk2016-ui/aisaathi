import { model, isValidApiKey, logger, TranslationRequest, parseGeminiResponse } from './shared-config';

// Supported languages mapping
const SUPPORTED_LANGUAGES = {
  'english': 'en',
  'hindi': 'hi',
  'tamil': 'ta',
  'telugu': 'te',
  'bengali': 'bn',
  'marathi': 'mr',
  'gujarati': 'gu',
  'kannada': 'kn',
  'malayalam': 'ml',
  'punjabi': 'pa',
  'urdu': 'ur',
  'sanskrit': 'sa'
};

function generateMockTranslation(request: TranslationRequest): any {
  /**Generate mock translation when Gemini is not available*/
  return {
    originalText: request.text,
    translatedText: `[TRANSLATED FROM ${request.fromLanguage.toUpperCase()} TO ${request.toLanguage.toUpperCase()}] ${request.text}`,
    fromLanguage: request.fromLanguage,
    toLanguage: request.toLanguage,
    confidence: 0.8,
    note: "Demo translation - Gemini service unavailable"
  };
}

function validateLanguages(fromLanguage: string, toLanguage: string): boolean {
  const fromLang = fromLanguage.toLowerCase();
  const toLang = toLanguage.toLowerCase();
  
  return Object.keys(SUPPORTED_LANGUAGES).includes(fromLang) && 
         Object.keys(SUPPORTED_LANGUAGES).includes(toLang);
}

export async function translateContent(request: TranslationRequest): Promise<any> {
  /**Translate content using Multilingual Agent*/
  try {
    if (!validateLanguages(request.fromLanguage, request.toLanguage)) {
      logger.error(`Unsupported language pair: ${request.fromLanguage} to ${request.toLanguage}`);
      return {
        error: "Unsupported language pair",
        supportedLanguages: Object.keys(SUPPORTED_LANGUAGES)
      };
    }

    if (!isValidApiKey || !model) {
      logger.warn("Gemini API not configured, using mock content");
      return generateMockTranslation(request);
    }

    const prompt = `Translate the following text from ${request.fromLanguage} to ${request.toLanguage}.
    
    Text to translate: "${request.text}"
    
    Requirements:
    - Maintain the original meaning and context
    - Use appropriate cultural context for Indian languages
    - Preserve any educational terminology
    - Ensure the translation is natural and fluent
    
    Return the response as a JSON object with the following structure:
    {
      "originalText": "Original text",
      "translatedText": "Translated text",
      "fromLanguage": "Source language",
      "toLanguage": "Target language",
      "confidence": 0.95,
      "culturalNotes": "Any cultural context notes",
      "alternatives": ["alternative translation 1", "alternative translation 2"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsedResponse = parseGeminiResponse(text);
    
    if (parsedResponse.error) {
      logger.error(`Failed to parse Gemini response: ${parsedResponse.error}`);
      return generateMockTranslation(request);
    }
    
    return {
      ...parsedResponse,
      fromLanguage: request.fromLanguage,
      toLanguage: request.toLanguage
    };
    
  } catch (error) {
    logger.error(`Multilingual Agent Error: ${error}`);
    return generateMockTranslation(request);
  }
}

export function getSupportedLanguages(): string[] {
  return Object.keys(SUPPORTED_LANGUAGES);
} 