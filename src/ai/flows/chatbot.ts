
'use server';
/**
 * @fileOverview A conversational chatbot that can use tools.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

// Define schema types for export, but not the schemas themselves.
export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export type ChatInput = {
  messages: ChatMessage[];
};

export type ChatOutput = {
  message: ChatMessage;
};

const chatPrompt = `You are a friendly and helpful AI assistant.

Your goal is to provide accurate and helpful answers to the user's questions.

If you do not know the answer to a question, you must use the provided tools to find the information. Do not make up answers.

Always be polite and professional in your responses.`;

// The main function that the client will call.
export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

// Define the Genkit flow.
const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    // Define schemas inline, don't export them.
    inputSchema: z.object({
        messages: z.array(z.object({
            role: z.enum(['user', 'model']),
            content: z.string(),
        }))
    }),
    outputSchema: z.object({
        message: z.object({
            role: z.enum(['user', 'model']),
            content: z.string(),
        })
    }),
  },
  async ({messages}) => {
    const llmResponse = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: chatPrompt,
      history: messages,
      tools: [googleAI.googleSearch],
    });

    const content = llmResponse.text();
    if (!content) {
      throw new Error('No response from AI');
    }

    return {
      message: {
        role: 'model',
        content: content,
      },
    };
  }
);
