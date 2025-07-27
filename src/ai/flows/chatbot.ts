
'use server';

/**
 * @fileOverview A conversational AI chatbot flow that can use tools.
 *
 * - chat - A function that handles the conversation with the chatbot.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const ChatInputSchema = z.object({
  query: z.string().describe('The user query for the chatbot.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The response from the chatbot.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const llmResponse = await ai.generate({
      prompt: `You are a helpful chatbot. Your goal is to provide accurate and helpful answers to the user's questions. 
      
If you do not know the answer to a question, you must use the provided tools to find the information. Do not make up answers.

Respond to the following query:

${input.query}`,
      tools: [googleAI.googleSearch],
      model: googleAI.model('gemini-2.0-flash'),
    });
    
    return {
        response: llmResponse.text,
    };
  }
);
