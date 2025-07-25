'use server';
/**
 * @fileOverview Checks grammar and style of a given text.
 *
 * - checkGrammar - A function that checks and corrects the grammar and style.
 * - CheckGrammarInput - The input type for the checkGrammar function.
 * - CheckGrammarOutput - The return type for the checkGrammar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckGrammarInputSchema = z.object({
  text: z.string().describe('The text to check for grammar and style.'),
});
export type CheckGrammarInput = z.infer<typeof CheckGrammarInputSchema>;

const CheckGrammarOutputSchema = z.object({
  correctedText: z.string().describe('The text with corrected grammar and style.'),
});
export type CheckGrammarOutput = z.infer<typeof CheckGrammarOutputSchema>;

export async function checkGrammar(input: CheckGrammarInput): Promise<CheckGrammarOutput> {
  return checkGrammarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkGrammarPrompt',
  input: {schema: CheckGrammarInputSchema},
  output: {schema: CheckGrammarOutputSchema},
  prompt: `You are an expert editor. Please correct the grammar and improve the style of the following text. Only output the corrected text.
  
  Text:
  {{{text}}}`,
});

const checkGrammarFlow = ai.defineFlow(
  {
    name: 'checkGrammarFlow',
    inputSchema: CheckGrammarInputSchema,
    outputSchema: CheckGrammarOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
