import { generateAIResponse } from "./groqApi";
import { CourseModule, Quiz, QuizQuestion } from "@/types/book";

export const generateCourseFromChunks = async (
  bookId: string,
  chunks: string[],
  title: string,
  author: string,
): Promise<{ modules: CourseModule[]; quizzes: Quiz[] }> => {
  const modules: CourseModule[] = [];
  const quizzes: Quiz[] = [];
  let previousSummary = "";

  for (let i = 0; i < chunks.length; i++) {
    const chunkNumber = i + 1;
    const totalChunks = chunks.length;
    const chunk = chunks[i];

    // Generate module content with context from previous chunks
    const moduleContent = await generateModuleContent(
      chunk,
      previousSummary,
      chunkNumber,
      totalChunks,
      title,
      author,
    );

    // Create module
    const moduleId = `m-${Date.now()}-${chunkNumber}`;
    const module: CourseModule = {
      id: moduleId,
      bookId,
      title: `Chapter ${chunkNumber}: ${moduleContent.title}`,
      content: moduleContent.content,
      order: chunkNumber,
      completed: false,
    };

    modules.push(module);

    // Generate quiz for this module
    const quizQuestions = await generateQuizQuestions(
      chunk,
      previousSummary,
      title,
    );

    const quiz: Quiz = {
      id: `q-${Date.now()}-${chunkNumber}`,
      moduleId,
      questions: quizQuestions,
      completed: false,
    };

    quizzes.push(quiz);

    // Update previous summary for context in next chunk
    previousSummary = moduleContent.summary;
  }

  return { modules, quizzes };
};

interface ModuleContent {
  title: string;
  content: string;
  summary: string;
}

async function generateModuleContent(
  chunk: string,
  previousSummary: string,
  chunkNumber: number,
  totalChunks: number,
  bookTitle: string,
  author: string,
): Promise<ModuleContent> {
  const contextPrompt = previousSummary
    ? `Previous content summary: ${previousSummary}\n\nCurrent chunk (${chunkNumber}/${totalChunks}): ${chunk}`
    : `First chunk (${chunkNumber}/${totalChunks}) of the book "${bookTitle}" by ${author}: ${chunk}`;

  const prompt = `You are creating an educational module based on the following content from the book "${bookTitle}" by ${author}. 
  ${contextPrompt}

  Please generate:
  1. A concise title for this section (without "Chapter" or numbering)
  2. Educational content that explains the key concepts in this section
  3. A brief summary of this section that will be used to maintain context for the next section

  Format your response exactly as follows (keep the JSON format):
  {"title":"Section Title","content":"Educational content goes here...","summary":"Brief summary of this section..."}`;

  try {
    const response = await generateAIResponse(prompt);
    // Parse the JSON response
    const parsedResponse = JSON.parse(response);
    return parsedResponse as ModuleContent;
  } catch (error) {
    console.error("Error generating module content:", error);
    // Fallback content if AI generation fails
    return {
      title: `Content from ${bookTitle} - Part ${chunkNumber}`,
      content: `This section covers part ${chunkNumber} of ${totalChunks} from the book. The AI has analyzed the content and extracted key concepts to help you understand the material better.`,
      summary: chunk.substring(0, 200) + "...",
    };
  }
}

async function generateQuizQuestions(
  chunk: string,
  previousSummary: string,
  bookTitle: string,
): Promise<QuizQuestion[]> {
  const maxQuestions = 5; // Limit to 5 questions for demo purposes, would be 50 in production

  const contextPrompt = previousSummary
    ? `Previous content summary: ${previousSummary}\n\nCurrent content: ${chunk}`
    : `Content from the book "${bookTitle}": ${chunk}`;

  const prompt = `Based on the following content from the book "${bookTitle}":
  ${contextPrompt}

  Generate ${maxQuestions} multiple-choice quiz questions to test understanding of the key concepts.
  Each question should have 4 options with only one correct answer.
  Also provide a brief explanation for why the correct answer is right.

  Format your response as a JSON array of questions, exactly like this (maintain this exact JSON format):
  [
    {
      "question": "Question text goes here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why Option A is correct"
    },
    ...
  ]`;

  try {
    const response = await generateAIResponse(prompt);
    // Parse the JSON response
    const parsedQuestions = JSON.parse(response);

    // Validate and format questions
    return parsedQuestions
      .slice(0, maxQuestions)
      .map((q: any, index: number) => ({
        id: `qq-${Date.now()}-${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    // Fallback questions if AI generation fails
    return Array(maxQuestions)
      .fill(0)
      .map((_, index) => ({
        id: `qq-${Date.now()}-${index}`,
        question: `Sample question ${index + 1} about the content?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "This is a sample explanation for the correct answer.",
      }));
  }
}
