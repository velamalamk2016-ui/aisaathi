import { model, isValidApiKey, logger, AssessmentRequest, parseGeminiResponse } from './shared-config';

function generateMockAssessment(request: AssessmentRequest): any {
  /**Generate mock assessment when Gemini is not available*/
  const questions = [];
  
  for (let i = 1; i <= request.questionCount; i++) {
    questions.push({
      question: `Sample question ${i} about ${request.topic}`,
      type: "multiple-choice",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: `Sample explanation for question ${i}`,
      difficulty: "medium"
    });
  }

  return {
    title: `${request.subject} Assessment - ${request.topic}`,
    questions,
    instructions: "Assessment instructions",
    timeLimit: request.questionCount * 2, // 2 minutes per question
    note: "Demo content - Gemini service unavailable"
  };
}

export async function generateAssessment(request: AssessmentRequest): Promise<any> {
  /**Generate assessment using Assessment Agent*/
  try {
    if (!isValidApiKey || !model) {
      logger.warn("Gemini API not configured, using mock content");
      return generateMockAssessment(request);
    }

    const prompt = `Create an assessment for ${request.subject} grade ${request.grade} on topic "${request.topic}" in ${request.language}.
    
    Requirements:
    - Number of questions: ${request.questionCount}
    - Age-appropriate for grade ${request.grade}
    - Mix of question types (multiple-choice, true/false, short answer)
    - Include immediate feedback/explanations
    - Culturally relevant for Indian students
    - Progressive difficulty levels
    
    Return the response as a JSON object with the following structure:
    {
      "title": "Assessment Title",
      "questions": [
        {
          "question": "Question text",
          "type": "multiple-choice|true-false|short-answer",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": "correct answer",
          "explanation": "Why this is correct",
          "difficulty": "easy|medium|hard"
        }
      ],
      "instructions": "Assessment instructions",
      "timeLimit": estimated_minutes,
      "scoring": "How to score the assessment",
      "culturalContext": "How it relates to Indian culture"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsedResponse = parseGeminiResponse(text);
    
    if (parsedResponse.error) {
      logger.error(`Failed to parse Gemini response: ${parsedResponse.error}`);
      return generateMockAssessment(request);
    }
    
    return {
      ...parsedResponse,
      culturalContext: parsedResponse.culturalContext || "Culturally relevant for Indian students"
    };
    
  } catch (error) {
    logger.error(`Assessment Agent Error: ${error}`);
    return generateMockAssessment(request);
  }
} 