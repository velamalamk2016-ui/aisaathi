import { model, isValidApiKey, logger, StoryRequest, parseGeminiResponse } from './shared-config';

function generateMockStory(request: StoryRequest): any {
  /**Generate mock story when Gemini is not available*/
  return {
    title: `Story about ${request.theme}`,
    content: `A story about ${request.theme} featuring ${request.characters?.join(", ") || 'characters'} that teaches: ${request.moral}`,
    moral: request.moral,
    characters: request.characters || [],
    activities: ["Discussion questions", "Role-play activity"],
    gradeLevel: request.grades.join(", "),
    language: request.language,
    note: "Demo content - Gemini service unavailable"
  };
}

export async function generateStory(request: StoryRequest): Promise<any> {
  /**Generate story using Storyteller Agent*/
  try {
    if (!isValidApiKey || !model) {
      logger.warn("Gemini API not configured, using mock content");
      return generateMockStory(request);
    }

    const gradesText = request.grades.join(", ");
    const charactersText = request.characters.join(", ");

    const prompt = `Create an educational story for grades ${gradesText} in ${request.language} about the theme "${request.theme}".
    
    Requirements:
    - Characters: ${charactersText}
    - Moral lesson: ${request.moral}
    - Age-appropriate for grades ${gradesText}
    - Culturally relevant for Indian students
    - Include engaging plot and dialogue
    - Educational value
    
    Return the response as a JSON object with the following structure:
    {
      "title": "Story Title",
      "content": "Full story text with dialogue and narration",
      "moral": "The moral lesson of the story",
      "characters": ["character1", "character2"],
      "activities": ["discussion question 1", "discussion question 2", "role-play activity"],
      "gradeLevel": "target grades",
      "language": "story language",
      "culturalContext": "How it relates to Indian culture",
      "vocabulary": ["new word 1", "new word 2"],
      "comprehensionQuestions": ["question 1", "question 2", "question 3"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsedResponse = parseGeminiResponse(text);
    
    if (parsedResponse.error) {
      logger.error(`Failed to parse Gemini response: ${parsedResponse.error}`);
      return generateMockStory(request);
    }
    
    return {
      ...parsedResponse,
      characters: request.characters,
      moral: request.moral,
      culturalContext: parsedResponse.culturalContext || "Culturally relevant for Indian students"
    };
    
  } catch (error) {
    logger.error(`Storyteller Agent Error: ${error}`);
    return generateMockStory(request);
  }
} 