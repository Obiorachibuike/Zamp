'use server';
/**
 * @fileOverview A flow to generate an animated video from a static image.
 *
 * - imageToAnimation - A function that takes an image and a prompt and returns an animated video.
 * - ImageToAnimationInput - The input type for the imageToAnimation function.
 * - ImageToAnimationOutput - The return type for the imageToAnimation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const ImageToAnimationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to animate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The text prompt describing the desired animation.'),
});
export type ImageToAnimationInput = z.infer<typeof ImageToAnimationInputSchema>;

const ImageToAnimationOutputSchema = z.object({
  video: z
    .string()
    .describe(
      'The generated video as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ImageToAnimationOutput = z.infer<typeof ImageToAnimationOutputSchema>;

export async function imageToAnimation(input: ImageToAnimationInput): Promise<ImageToAnimationOutput> {
  return imageToAnimationFlow(input);
}

const imageToAnimationFlow = ai.defineFlow(
  {
    name: 'imageToAnimationFlow',
    inputSchema: ImageToAnimationInputSchema,
    outputSchema: ImageToAnimationOutputSchema,
  },
  async input => {
    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: input.prompt},
      ],
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
        personGeneration: 'allow_adult',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const videoPart = operation.output?.message?.content.find(p => !!p.media);
    if (!videoPart || !videoPart.media) {
      throw new Error('Failed to find the generated video');
    }

    // This is a workaround to get the video data as base64
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
      `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`
    );
    if (!videoDownloadResponse.ok) {
        throw new Error(`Failed to download video: ${videoDownloadResponse.statusText}`);
    }
    const buffer = await videoDownloadResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    return {video: `data:video/mp4;base64,${base64}`};
  }
);
