
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
  instructions: z.string().optional().describe('Instructions on which person to use, e.g., "the person on the left".'),
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
    const userPrompt = input.instructions ? ` Target the following person for the headshot: ${input.instructions}.` : '';

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: `Generate a professional corporate headshot using the face from this image. It is critical that you DO NOT change the person's facial features. The final image should look like a real photograph, not an illustration. The subject should be wearing professional business attire. The background should be a simple, neutral, out-of-focus office or studio setting. The lighting should be soft and flattering, like a professional photoshoot. Ensure the final image is a high-quality, realistic photograph.${userPrompt}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {image: media.url!};
  }
);
