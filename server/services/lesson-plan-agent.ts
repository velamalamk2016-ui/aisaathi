import { model, isValidApiKey, logger, LessonPlanRequest, parseGeminiResponse } from './shared-config';

function generateMockLessonPlan(request: LessonPlanRequest): any {
  /**Generate mock lesson plan when Gemini is not available*/
  const timeBreakdown = [];
  const totalTime = request.timeLimit;
  
  // Simple time breakdown
  if (totalTime >= 30) {
    timeBreakdown.push(
      { activity: "Introduction", duration: 5, grades: request.grades },
      { activity: "Main Activity", duration: totalTime - 15, grades: request.grades },
      { activity: "Wrap-up", duration: 10, grades: request.grades }
    );
  } else {
    timeBreakdown.push(
      { activity: "Introduction", duration: 3, grades: request.grades },
      { activity: "Main Activity", duration: totalTime - 8, grades: request.grades },
      { activity: "Wrap-up", duration: 5, grades: request.grades }
    );
  }

  return {
    title: `${request.subject} Lesson Plan - ${request.topic}`,
    objective: `Students will learn about ${request.topic}`,
    timeBreakdown,
    materials: request.materials || [],
    instructions: "Multi-grade teaching instructions",
    adaptations: "Adaptable for different skill levels",
    note: "Demo content - Gemini service unavailable"
  };
}

export async function generateLessonPlan(request: LessonPlanRequest): Promise<any> {
  /**Generate lesson plan using Lesson Plan Agent*/
  try {
    if (!isValidApiKey || !model) {
      logger.warn("Gemini API not configured, using mock content");
      return generateMockLessonPlan(request);
    }

    const gradesText = request.grades.join(", ");
    const materialsText = request.materials.join(", ");

    const prompt = `Create a comprehensive lesson plan for ${request.subject} on topic "${request.topic}" in ${request.language}.
    
    Requirements:
    - Target grades: ${gradesText}
    - Time limit: ${request.timeLimit} minutes
    - Available materials: ${materialsText}
    - Multi-grade classroom approach
    - Culturally relevant for Indian students
    - Include time breakdown for each activity
    - Provide adaptations for different skill levels
    
    Return the response as a JSON object with the following structure:
    {
      "title": "Lesson Plan Title",
      "objective": "Clear learning objective",
      "timeBreakdown": [
        {
          "activity": "Activity name",
          "duration": minutes,
          "grades": [grade numbers],
          "description": "Activity description"
        }
      ],
      "materials": ["list", "of", "materials"],
      "instructions": "Detailed teaching instructions",
      "adaptations": "How to adapt for different skill levels",
      "assessment": "How to assess student learning",
      "culturalContext": "How it relates to Indian culture"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsedResponse = parseGeminiResponse(text);
    
    if (parsedResponse.error) {
      logger.error(`Failed to parse Gemini response: ${parsedResponse.error}`);
      return generateMockLessonPlan(request);
    }
    
    return {
      ...parsedResponse,
      materials: request.materials,
      culturalContext: parsedResponse.culturalContext || "Culturally relevant for Indian students"
    };
    
  } catch (error) {
    logger.error(`Lesson Plan Agent Error: ${error}`);
    return generateMockLessonPlan(request);
  }
} 