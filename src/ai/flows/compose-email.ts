'use server';

/**
 * @fileOverview AI agent that composes email drafts based on user prompts.
 *
 * - composeEmail - A function that generates email drafts.
 * - ComposeEmailInput - The input type for the composeEmail function.
 * - ComposeEmailOutput - The return type for the composeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComposeEmailInputSchema = z.object({
  prompt: z.string().describe('A brief description of the email to compose.'),
});
export type ComposeEmailInput = z.infer<typeof ComposeEmailInputSchema>;

const ComposeEmailOutputSchema = z.object({
  emailDraft: z.string().describe('The AI-generated email draft.'),
});
export type ComposeEmailOutput = z.infer<typeof ComposeEmailOutputSchema>;

export async function composeEmail(input: ComposeEmailInput): Promise<ComposeEmailOutput> {
  return composeEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'composeEmailPrompt',
  input: {schema: ComposeEmailInputSchema},
  output: {schema: ComposeEmailOutputSchema},
  prompt: `You are an AI email composer. Please generate an email draft based on the following description: {{{prompt}}}.`,
});

const composeEmailFlow = ai.defineFlow(
  {
    name: 'composeEmailFlow',
    inputSchema: ComposeEmailInputSchema,
    outputSchema: ComposeEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
