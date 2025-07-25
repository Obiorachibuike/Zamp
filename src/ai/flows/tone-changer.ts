'use server';
/**
 * @fileOverview A flow to change the tone of a piece of text.
 *
 * - changeTone - A function that takes text and a target tone, and returns the rewritten text.
 * - ChangeToneInput - The input type for the changeTone function.
 * - ChangeToneOutput - The return type for the changeTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChangeToneInputSchema = z.object({
  text: z.string().describe('The text to rewrite.'),
  tone: z
    .enum(['Formal', 'Casual', 'Friendly', 'Professional', 'Humorous'])
    .describe('The target tone for the rewritten text.'),
});
export type ChangeToneInput = z.infer<typeof ChangeToneInputSchema>;

const ChangeToneOutputSchema = z.object({
  rewrittenText: z
    .string()
    .describe('The text rewritten in the specified tone.'),
});
export type ChangeToneOutput = z.infer<typeof ChangeToneOutputSchema>;

export async function changeTone(
  input: ChangeToneInput
): Promise<ChangeToneOutput> {
  return toneChangerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'toneChangerPrompt',
  input: {schema: ChangeToneInputSchema},
  output: {schema: ChangeToneOutputSchema},
  prompt: `Rewrite the following text in a {{{tone}}} tone. Only output the rewritten text.

Text:
{{{text}}}`,
});

const toneChangerFlow = ai.defineFlow(
  {
    name: 'toneChangerFlow',
    inputSchema: ChangeToneInputSchema,
    outputSchema: ChangeToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
