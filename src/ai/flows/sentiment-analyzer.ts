'use server';
/**
 * @fileOverview A flow to analyze the sentiment of a piece of text.
 *
 * - analyzeSentiment - A function that takes text and returns its sentiment.
 * - AnalyzeSentimentInput - The input type for the analyzeSentiment function.
 * - AnalyzeSentimentOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSentimentInputSchema = z.object({
  text: z.string().describe('The text to analyze.'),
});
export type AnalyzeSentimentInput = z.infer<typeof AnalyzeSentimentInputSchema>;

const AnalyzeSentimentOutputSchema = z.object({
  sentiment: z
    .enum(['Positive', 'Negative', 'Neutral'])
    .describe('The sentiment of the text.'),
});
export type AnalyzeSentimentOutput = z.infer<
  typeof AnalyzeSentimentOutputSchema
>;

export async function analyzeSentiment(
  input: AnalyzeSentimentInput
): Promise<AnalyzeSentimentOutput> {
  return sentimentAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sentimentAnalyzerPrompt',
  input: {schema: AnalyzeSentimentInputSchema},
  output: {schema: AnalyzeSentimentOutputSchema},
  prompt: `Analyze the sentiment of the following text. Respond with only "Positive", "Negative", or "Neutral".

Text:
{{{text}}}`,
});

const sentimentAnalyzerFlow = ai.defineFlow(
  {
    name: 'sentimentAnalyzerFlow',
    inputSchema: AnalyzeSentimentInputSchema,
    outputSchema: AnalyzeSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
