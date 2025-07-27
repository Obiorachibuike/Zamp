
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
      "A photo to use as a base, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type GenerateLinkedInHeadshotInput = z.infer<typeof GenerateLinkedInHeadshotInputSchema>;

const GenerateLinkedInHeadshotOutputSchema = z.object({
  image: z
    .string()
    .describe(
      'The generated headshot image as a data URI.'
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
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.photoDataUri } },
        {
          text: `Transform this photo into a professional LinkedIn headshot. Retain the subject's facial features and identity, but enhance overall clarity and lighting. Use a soft, neutral background such as light gray, white, or corporate blue. The subject should be centered, looking directly at the camera, with a confident and approachable expression. Adjust clothing to look business casual or formal — such as a blazer, dress shirt, or blouse. Ensure even skin tone, natural retouching, and a clean, high-resolution finish suitable for a corporate profile.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imageUrl = media?.url;
    if (!imageUrl) {
      throw new Error('Could not generate an image.');
    }

    return {
      image: imageUrl,
    };
  }
);
