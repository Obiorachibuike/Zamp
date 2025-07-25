'use server';
/**
 * @fileOverview A flow to make AI-generated text sound more human.
 *
 * - humanizeText - A function that rewrites text to sound more natural.
 * - HumanizeTextInput - The input type for the humanizeText function.
 * - HumanizeTextOutput - The return type for the humanizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HumanizeTextInputSchema = z.object({
  text: z.string().describe('The AI-generated text to humanize.'),
});
export type HumanizeTextInput = z.infer<typeof HumanizeTextInputSchema>;

const HumanizeTextOutputSchema = z.object({
  humanizedText: z
    .string()
    .describe('The text rewritten to sound more human.'),
});
export type HumanizeTextOutput = z.infer<typeof HumanizeTextOutputSchema>;

export async function humanizeText(
  input: HumanizeTextInput
): Promise<HumanizeTextOutput> {
  return humanizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'humanizerPrompt',
  input: {schema: HumanizeTextInputSchema},
  output: {schema: HumanizeTextOutputSchema},
  prompt: `Rewrite the following text to make it sound more like it was written by a human. Make it more engaging, natural, and less robotic. Vary sentence structure and word choice. Only output the rewritten text.

Text:
{{{text}}}`,
});

const humanizerFlow = ai.defineFlow(
  {
    name: 'humanizerFlow',
    inputSchema: HumanizeTextInputSchema,
    outputSchema: HumanizeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
