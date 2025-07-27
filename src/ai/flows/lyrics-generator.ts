'use server';
/**
 * @fileOverview A flow to generate song lyrics.
 *
 * - generateLyrics - A function that takes a prompt and genre to generate lyrics.
 * - GenerateLyricsInput - The input type for the generateLyrics function.
 * - GenerateLyricsOutput - The return type for the generateLyrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLyricsInputSchema = z.object({
  prompt: z.string().describe('A brief description of the song topic.'),
  genre: z
    .enum(['Pop', 'Rock', 'Hip-Hop', 'Country', 'Electronic', 'R&B', 'Folk', 'Metal'])
    .describe('The musical genre of the song.'),
});
export type GenerateLyricsInput = z.infer<typeof GenerateLyricsInputSchema>;

const GenerateLyricsOutputSchema = z.object({
  lyrics: z.string().describe('The AI-generated song lyrics, including verse and chorus structure.'),
});
export type GenerateLyricsOutput = z.infer<typeof GenerateLyricsOutputSchema>;

export async function generateLyrics(input: GenerateLyricsInput): Promise<GenerateLyricsOutput> {
  return generateLyricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLyricsPrompt',
  input: {schema: GenerateLyricsInputSchema},
  output: {schema: GenerateLyricsOutputSchema},
  prompt: `You are an expert songwriter. Write a song in the {{{genre}}} genre about the following topic: "{{{prompt}}}".

The lyrics should have a clear structure, such as verses, a chorus, and a bridge. Make them creative and evocative.`,
});

const generateLyricsFlow = ai.defineFlow(
  {
    name: 'generateLyricsFlow',
    inputSchema: GenerateLyricsInputSchema,
    outputSchema: GenerateLyricsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
