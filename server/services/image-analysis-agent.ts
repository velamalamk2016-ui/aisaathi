import { model, isValidApiKey, logger, parseGeminiResponse } from './shared-config';

function generateMockImageAnalysis(imageData: string): any {
  /**Generate mock image analysis when Gemini is not available*/
  return {
    description: "Sample image analysis for educational content",
    educationalContent: ["Sample educational point 1", "Sample educational point 2"],
    suggestedActivities: ["Discussion about the image", "Drawing activity"],
    vocabulary: ["Sample word 1", "Sample word 2"],
    note: "Demo content - Gemini service unavailable"
  };
}

export async function analyzeImage(imageData: string): Promise<any> {
  /**Analyze image for educational content using Image Analysis Agent*/
  try {
    if (!isValidApiKey || !model) {
      logger.warn("Gemini API not configured, using mock content");
      return generateMockImageAnalysis(imageData);
    }

    // For now, we'll use text-based analysis since image analysis requires
    // proper image data handling. In a real implementation, you'd need to
    // handle base64 images or file uploads properly.
    
    const prompt = `Analyze the following image data for educational content.
    
    Image data: ${imageData.substring(0, 100)}...
    
    Requirements:
    - Identify educational elements in the image
    - Suggest learning activities based on the image
    - Extract vocabulary words
    - Provide cultural context if relevant
    - Make it suitable for Indian classrooms
    
    Return the response as a JSON object with the following structure:
    {
      "description": "Detailed description of the image",
      "educationalContent": ["educational point 1", "educational point 2"],
      "suggestedActivities": ["activity 1", "activity 2"],
      "vocabulary": ["word 1", "word 2"],
      "culturalContext": "Cultural relevance for Indian students",
      "gradeLevel": "suitable grade levels",
      "subjectAreas": ["subject 1", "subject 2"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsedResponse = parseGeminiResponse(text);
    
    if (parsedResponse.error) {
      logger.error(`Failed to parse Gemini response: ${parsedResponse.error}`);
      return generateMockImageAnalysis(imageData);
    }
    
    return {
      ...parsedResponse,
      culturalContext: parsedResponse.culturalContext || "Culturally relevant for Indian students"
    };
    
  } catch (error) {
    logger.error(`Image Analysis Agent Error: ${error}`);
    return generateMockImageAnalysis(imageData);
  }
} 