
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
  prompt: z.string().optional().describe('Optional text description for additional customization.'),
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
          text: `Your task is to act as a professional photographer creating a corporate headshot.
          
1.  **Analyze the Image:** First, carefully analyze the provided image to identify the main subject.
2.  **Generate Headshot:** Generate a single, new professional corporate headshot of the main subject. It is critical that you DO NOT change the person's facial features. The final image should look like a real photograph, not an illustration.
3.  **Style Guide for the Headshot:**
    *   **Attire:** The subject should be wearing professional business attire (e.g., a suit, blazer, or professional blouse).
    *   **Background:** The background must be a simple, neutral, out-of-focus office or studio setting.
    *   **Lighting:** The lighting should be soft and flattering, typical of a professional photoshoot.
    *   **Quality:** Ensure the final image is a high-quality, realistic photograph.
${input.prompt ? `\n4. **User's Additional Instructions:** ${input.prompt}` : ''}

Your final output must be a single generated headshot image.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imageUrl = media.url;
    if (!imageUrl) {
      throw new Error('Could not generate an image.');
    }

    return {
      image: imageUrl,
    };
  }
);
