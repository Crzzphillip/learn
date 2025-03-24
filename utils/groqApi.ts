import { Groq } from "groq";

let groqClient: Groq | null = null;

export const initGroqClient = (apiKey: string) => {
  groqClient = new Groq({ apiKey });
  return groqClient;
};

export const getGroqClient = () => {
  if (!groqClient) {
    throw new Error("Groq client not initialized. Call initGroqClient first.");
  }
  return groqClient;
};

export const generateAIResponse = async (
  prompt: string,
  moduleContext?: string,
): Promise<string> => {
  try {
    const client = getGroqClient();

    let systemPrompt =
      "You are a helpful AI learning assistant that helps users understand concepts from books and learning materials.";

    if (moduleContext) {
      systemPrompt += ` You are specifically helping with the following module: ${moduleContext}`;
    }

    const chatCompletion = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama3-8b-8192", // Using Llama 3 8B model, can be changed to other Groq models
      temperature: 0.7,
      max_tokens: 1000,
    });

    return (
      chatCompletion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm sorry, there was an error processing your request. Please try again later.";
  }
};
