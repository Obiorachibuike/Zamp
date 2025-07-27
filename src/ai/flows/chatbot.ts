
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
import {researchTopic} from './researcher';

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

const researchTool = ai.defineTool(
    {
        name: 'researcher',
        description: 'Use this tool to research a topic and get a summary and relevant links. This is useful for answering questions about topics you do not know about.',
        inputSchema: z.object({topic: z.string()}),
        outputSchema: z.any(),
    },
    async (input) => researchTopic(input)
);


const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  tools: [researchTool],
  prompt: `You are a helpful chatbot. Your goal is to provide accurate and helpful answers to the user's questions.
  
If you do not know the answer to a question, you must use the provided research tool to find the information. Do not make up answers.

Respond to the following query:

{{{query}}}`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await chatPrompt(input);
    return output!;
  }
);
