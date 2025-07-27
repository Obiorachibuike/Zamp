'use server';
/**
 * @fileOverview A conversational chatbot that can use tools.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatInputSchema = z.object({
  messages: z.array(ChatMessageSchema),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  message: ChatMessageSchema,
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = `You are a friendly and helpful AI assistant.

Your goal is to provide accurate and helpful answers to the user's questions.

If you do not know the answer to a question, you must use the provided tools to find the information. Do not make up answers.

Always be polite and professional in your responses.`;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({messages}) => {
    const llmResponse = await ai.generate({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: chatPrompt,
      history: messages,
      tools: [googleAI.googleSearch],
    });

    const response = llmResponse.output();
    if (!response) {
      throw new Error('No response from AI');
    }

    return {
      message: {
        role: 'model',
        content: response,
      },
    };
  }
);
