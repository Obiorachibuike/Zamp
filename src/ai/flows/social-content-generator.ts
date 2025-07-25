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
  generateImage: z.boolean().default(false).describe('Whether to generate an image for the post.'),
});
export type GenerateSocialContentInput = z.infer<typeof GenerateSocialContentInputSchema>;

const GenerateSocialContentOutputSchema = z.object({
  content: z.string().describe('The AI-generated social media content, including relevant hashtags.'),
  image: z
    .string()
    .optional()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. This is only returned if generateImage was true."
    ),
});
export type GenerateSocialContentOutput = z.infer<typeof GenerateSocialContentOutputSchema>;

export async function generateSocialContent(input: GenerateSocialContentInput): Promise<GenerateSocialContentOutput> {
  return socialContentGeneratorFlow(input);
}

const socialContentGeneratorFlow = ai.defineFlow(
  {
    name: 'socialContentGeneratorFlow',
    inputSchema: GenerateSocialContentInputSchema,
    outputSchema: GenerateSocialContentOutputSchema,
  },
  async input => {
    // Define a text-only output schema for the text generation part
    const TextOnlyOutputSchema = z.object({
      content: z.string().describe('The AI-generated social media content, including relevant hashtags.'),
    });

    // Define the prompt for generating text content
    const textPrompt = ai.definePrompt({
        name: 'socialContentGeneratorTextPrompt',
        input: {schema: GenerateSocialContentInputSchema},
        output: {schema: TextOnlyOutputSchema},
        prompt: `You are an expert social media manager. Generate a post for the {{{platform}}} platform based on the following prompt. Tailor the content, tone, and format (including relevant hashtags) to be optimal for that specific platform.

Prompt:
{{{prompt}}}`,
    });

    // Generate the text content
    const { output: textOutput } = await textPrompt(input);
    const content = textOutput!.content;

    let imageUrl: string | undefined;

    // If an image is requested, generate it
    if (input.generateImage) {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate an engaging and high-quality image for a social media post on ${input.platform}. The post is about: "${input.prompt}". The image should be visually appealing and relevant to the content: "${content}"`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      imageUrl = media.url;
    }
    
    return {
      content: content,
      image: imageUrl,
    };
  }
);
