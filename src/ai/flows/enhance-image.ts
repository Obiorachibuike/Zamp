'use server';
/**
 * @fileOverview A flow to enhance an image by deblurring, colorizing, or improving quality.
 *
 * - enhanceImage - A function that takes an image and an enhancement type and returns the enhanced image.
 * - EnhanceImageInput - The input type for the enhanceImage function.
 * - EnhanceImageOutput - The return type for the enhanceImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to enhance, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  enhancementType: z.enum(['deblur', 'colorize', 'enhance_quality']).describe('The type of enhancement to apply.'),
});
export type EnhanceImageInput = z.infer<typeof EnhanceImageInputSchema>;

const EnhanceImageOutputSchema = z.object({
  image: z
    .string()
    .describe(
      'The enhanced image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type EnhanceImageOutput = z.infer<typeof EnhanceImageOutputSchema>;

export async function enhanceImage(input: EnhanceImageInput): Promise<EnhanceImageOutput> {
  return enhanceImageFlow(input);
}

const getPromptForEnhancement = (type: EnhanceImageInput['enhancementType']) => {
    switch (type) {
        case 'deblur':
            return 'Deblur this image. Increase the sharpness and clarity of the subject. Make the details crisp and clear.';
        case 'colorize':
            return 'Colorize this black and white image. Add realistic and vibrant colors to the scene. The colorization should be natural and historically appropriate if applicable.';
        case 'enhance_quality':
            return 'Enhance the quality of this image to make it high-definition. Improve the lighting, details, contrast, and overall clarity without altering the content. Fix any compression artifacts.';
        default:
            throw new Error('Invalid enhancement type');
    }
}

const enhanceImageFlow = ai.defineFlow(
  {
    name: 'enhanceImageFlow',
    inputSchema: EnhanceImageInputSchema,
    outputSchema: EnhanceImageOutputSchema,
  },
  async ({ photoDataUri, enhancementType }) => {
    const prompt = getPromptForEnhancement(enhancementType);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: photoDataUri}},
        {text: prompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {image: media.url!};
  }
);
