'use server';
/**
 * @fileOverview A flow to convert an image to a cartoon style.
 *
 * - imageToCartoon - A function that takes an image and returns the cartoon version.
 * - ImageToCartoonInput - The input type for the imageToCartoon function.
 * - ImageToCartoonOutput - The return type for the imageToCartoon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageToCartoonInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to convert, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToCartoonInput = z.infer<typeof ImageToCartoonInputSchema>;

const ImageToCartoonOutputSchema = z.object({
  image: z
    .string()
    .describe(
      'The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ImageToCartoonOutput = z.infer<typeof ImageToCartoonOutputSchema>;

export async function imageToCartoon(input: ImageToCartoonInput): Promise<ImageToCartoonOutput> {
  return imageToCartoonFlow(input);
}

const imageToCartoonFlow = ai.defineFlow(
  {
    name: 'imageToCartoonFlow',
    inputSchema: ImageToCartoonInputSchema,
    outputSchema: ImageToCartoonOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'Convert this image to a cartoon style. The output should be a colorful, playful cartoon version of the original image.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {image: media.url!};
  }
);
