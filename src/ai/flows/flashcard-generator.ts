'use server';
/**
 * @fileOverview A flow to generate flashcards from a piece of text.
 *
 * - generateFlashcards - A function that takes text and returns a set of flashcards.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  text: z.string().describe('The text to generate flashcards from.'),
  numFlashcards: z.number().int().min(1).max(50).default(10).describe('The number of flashcards to generate.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
    term: z.string().describe('The term or question for the front of the flashcard.'),
    definition: z.string().describe('The definition or answer for the back of the flashcard.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('The list of generated flashcards.'),
  title: z.string().describe('A title for the flashcard deck.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return flashcardGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'flashcardGeneratorPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert at creating study materials. Generate a set of {{{numFlashcards}}} flashcards based on the following text. Each flashcard should have a clear term and a concise definition. Also, create a suitable title for the flashcard deck.

Text:
{{{text}}}`,
});

const flashcardGeneratorFlow = ai.defineFlow(
  {
    name: 'flashcardGeneratorFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
