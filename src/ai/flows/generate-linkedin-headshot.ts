
'use server';
/**
 * @fileOverview A flow to generate professional LinkedIn headshots from an image.
 *
 * - generateLinkedInHeadshot - A function that takes an image and returns professional headshots for each detected face.
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
  images: z
    .array(z.string())
    .describe(
      'The generated headshot images as a list of data URIs.'
    ),
    faceCount: z.number().int().describe('The number of faces detected and headshots generated.'),
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
    // This is a complex prompt that asks the model to perform multiple steps.
    // 1. Detect all faces.
    // 2. For each face, generate a new image.
    // 3. The schema expects an array of strings (the image data URIs).
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.photoDataUri } },
        {
          text: `Your task is to act as a professional photographer creating corporate headshots.
          
1.  **Analyze the Image:** First, carefully analyze the provided image and detect every individual human face present.
2.  **Generate Headshots:** For each unique face you detect, generate a separate, new professional corporate headshot. It is critical that you DO NOT change the person's facial features. The final image should look like a real photograph, not an illustration.
3.  **Style Guide for Each Headshot:**
    *   **Attire:** The subject should be wearing professional business attire (e.g., a suit, blazer, or professional blouse).
    *   **Background:** The background must be a simple, neutral, out-of-focus office or studio setting.
    *   **Lighting:** The lighting should be soft and flattering, typical of a professional photoshoot.
    *   **Quality:** Ensure the final image is a high-quality, realistic photograph.
${input.prompt ? `\n4. **User's Additional Instructions:** ${input.prompt}` : ''}

Your final output must be a collection of these generated headshot images, one for each person detected in the original photo.`,
        },
      ],
      config: {
        // The model will return multiple images if it detects multiple faces.
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imageUrls = media.parts?.filter(p => p.media).map(p => p.media!.url) || (media.url ? [media.url] : []);


    return {
      images: imageUrls,
      faceCount: imageUrls.length,
    };
  }
);
