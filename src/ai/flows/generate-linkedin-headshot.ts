'use server';
/**
 * @fileOverview A flow to generate a professional LinkedIn headshot from an image.
 *
 * - generateLinkedInHeadshot - A function that takes an image and returns a professional headshot.
 * - GenerateLinkedInHeadshotInput - The input type for the function.
 * - GenerateLinkedInHeadshotOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLinkedInHeadshotInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to use as a base, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().optional().describe('An optional text description to guide the headshot generation.'),
});
export type GenerateLinkedInHeadshotInput = z.infer<typeof GenerateLinkedInHeadshotInputSchema>;

const GenerateLinkedInHeadshotOutputSchema = z.object({
  image: z
    .string()
    .describe(
      'The generated headshot image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateLinkedInHeadshotOutput = z.infer<typeof GenerateLinkedInHeadshotOutputSchema>;

export async function generateLinkedInHeadshot(input: GenerateLinkedInHeadshotInput): Promise<GenerateLinkedInHeadshotOutput> {
  return generateLinkedInHeadshotFlow(input);
}

const generateLinkedInHeadshotFlow = ai.defineFlow(
  {
    name: 'generateLinkedInHeadshotFlow',
    inputSchema: GenerateLinkedInHeadshotInputSchema,
    outputSchema: GenerateLinkedInHeadshotOutputSchema,
  },
  async input => {
    const userPrompt = input.prompt ? ` Additional user instructions: ${input.prompt}` : '';

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: `Generate a professional corporate headshot suitable for a LinkedIn profile from this image. The final image should look like a real photograph, not an illustration or a painting. The subject should be wearing professional business attire. The background should be a simple, neutral, out-of-focus office or studio setting. The lighting should be soft and flattering, like a professional photoshoot. Ensure the final image is a high-quality, realistic photograph.${userPrompt}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {image: media.url!};
  }
);
