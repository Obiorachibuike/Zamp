'use server';
/**
 * @fileOverview A flow to generate social media content.
 *
 * - generateSocialContent - A function that takes a prompt and platform to generate content.
 * - GenerateSocialContentInput - The input type for the generateSocialContent function.
 * - GenerateSocialContentOutput - The return type for the generateSocialContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSocialContentInputSchema = z.object({
  prompt: z.string().describe('A brief description of the social media post to generate.'),
  platform: z
    .enum(['Twitter', 'LinkedIn', 'Instagram', 'Facebook'])
    .describe('The social media platform the content is for.'),
});
export type GenerateSocialContentInput = z.infer<typeof GenerateSocialContentInputSchema>;

const GenerateSocialContentOutputSchema = z.object({
  content: z.string().describe('The AI-generated social media content.'),
});
export type GenerateSocialContentOutput = z.infer<typeof GenerateSocialContentOutputSchema>;

export async function generateSocialContent(input: GenerateSocialContentInput): Promise<GenerateSocialContentOutput> {
  return socialContentGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'socialContentGeneratorPrompt',
  input: {schema: GenerateSocialContentInputSchema},
  output: {schema: GenerateSocialContentOutputSchema},
  prompt: `You are an expert social media manager. Generate a post for the {{{platform}}} platform based on the following prompt. Tailor the content, tone, and format (including hashtags) to be optimal for that specific platform.

Prompt:
{{{prompt}}}`,
});

const socialContentGeneratorFlow = ai.defineFlow(
  {
    name: 'socialContentGeneratorFlow',
    inputSchema: GenerateSocialContentInputSchema,
    outputSchema: GenerateSocialContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
