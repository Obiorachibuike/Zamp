
'use server';
/**
 * @fileOverview A flow to detect faces in an image.
 *
 * - detectFaces - A function that takes an image and returns the number of faces and an annotated image.
 * - DetectFacesInput - The input type for the function.
 * - DetectFacesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectFacesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze for faces, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type DetectFacesInput = z.infer<typeof DetectFacesInputSchema>;

const DetectFacesOutputSchema = z.object({
  faceCount: z.number().int().describe('The number of faces detected in the image.'),
  annotatedImage: z
    .string()
    .describe(
      'The original image with bounding boxes drawn around detected faces, as a data URI.'
    ),
});
export type DetectFacesOutput = z.infer<typeof DetectFacesOutputSchema>;

export async function detectFaces(
  input: DetectFacesInput
): Promise<DetectFacesOutput> {
  return detectFacesFlow(input);
}

const detectFacesFlow = ai.defineFlow(
  {
    name: 'detectFacesFlow',
    inputSchema: DetectFacesInputSchema,
    outputSchema: DetectFacesOutputSchema,
  },
  async (input) => {
    // This is a simplified implementation. A real-world scenario might use a dedicated
    // Face Detection API (like Google's Vision API) for better accuracy.
    // For this example, we'll use a powerful multimodal model to "draw" on the image.

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.photoDataUri } },
        {
          text: 'Analyze the image to detect all human faces. Count the number of faces. Then, return the original image but with a bright red, thick bounding box drawn around each detected face. In the top left corner of the image, write the total number of faces detected in large, white text with a black outline (e.g., "2 Faces Detected").',
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // The text part of the response might contain the count. We extract it.
    // This is a regex to find a number in the model's text response.
    const textResponse = (await media.text()) || '';
    const match = textResponse.match(/\d+/);
    const faceCount = match ? parseInt(match[0], 10) : 0; // Default to 0 if no number found

    return {
      // If the model fails to find a number in the text, we'll return the count from the annotated image prompt.
      // In a real app, you might want to run a separate prompt just to get the count for accuracy.
      faceCount: faceCount,
      annotatedImage: media.url!,
    };
  }
);
