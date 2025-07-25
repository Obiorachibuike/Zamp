'use server';

/**
 * @fileOverview AI agent that generates email replies.
 *
 * - generateEmailReply - A function that generates email replies.
 * - GenerateEmailReplyInput - The input type for the generateEmailReply function.
 * - GenerateEmailReplyOutput - The return type for the generateEmailReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmailReplyInputSchema = z.object({
  originalEmail: z.string().describe('The original email to reply to.'),
  replyPrompt: z.string().describe('A brief prompt describing the desired reply.'),
});
export type GenerateEmailReplyInput = z.infer<typeof GenerateEmailReplyInputSchema>;

const GenerateEmailReplyOutputSchema = z.object({
  replyDraft: z.string().describe('The AI-generated email reply draft.'),
});
export type GenerateEmailReplyOutput = z.infer<typeof GenerateEmailReplyOutputSchema>;

export async function generateEmailReply(input: GenerateEmailReplyInput): Promise<GenerateEmailReplyOutput> {
  return generateEmailReplyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmailReplyPrompt',
  input: {schema: GenerateEmailReplyInputSchema},
  output: {schema: GenerateEmailReplyOutputSchema},
  prompt: `You are an AI email assistant. Generate a reply to the following email based on the user's prompt.

Original Email:
{{{originalEmail}}}

---

User's instruction for the reply:
{{{replyPrompt}}}

---

Generate the reply draft now.`,
});

const generateEmailReplyFlow = ai.defineFlow(
  {
    name: 'generateEmailReplyFlow',
    inputSchema: GenerateEmailReplyInputSchema,
    outputSchema: GenerateEmailReplyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
