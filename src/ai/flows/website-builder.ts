'use server';
/**
 * @fileOverview A flow to generate a single-page website from a text prompt.
 *
 * - generateWebsite - A function that takes a text prompt and returns HTML code.
 * - GenerateWebsiteInput - The input type for the generateWebsite function.
 * - GenerateWebsiteOutput - The return type for the generateWebsite function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWebsiteInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the website to be built.'),
});
export type GenerateWebsiteInput = z.infer<typeof GenerateWebsiteInputSchema>;

const GenerateWebsiteOutputSchema = z.object({
  html: z.string().describe('The generated HTML code for the website, including Tailwind CSS classes.'),
});
export type GenerateWebsiteOutput = z.infer<typeof GenerateWebsiteOutputSchema>;

export async function generateWebsite(input: GenerateWebsiteInput): Promise<GenerateWebsiteOutput> {
  return generateWebsiteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWebsitePrompt',
  input: {schema: GenerateWebsiteInputSchema},
  output: {schema: GenerateWebsiteOutputSchema},
  prompt: `You are an expert web developer specializing in creating beautiful, modern, and responsive single-page websites using HTML and Tailwind CSS.

Your task is to generate the complete HTML for a single-page website based on the user's prompt.

**Requirements:**
1.  **Single HTML File:** The entire output must be a single, self-contained HTML file.
2.  **Tailwind CSS:** Use Tailwind CSS classes directly in the HTML for all styling. You must use the CDN link for Tailwind CSS in the <head> section: \`<script src="https://cdn.tailwindcss.com"></script>\`. Do not use any custom CSS or <style> blocks.
3.  **Content Sections:** Structure the website logically with clear sections (e.g., Hero, Features, About, Contact).
4.  **Responsive Design:** The layout must be fully responsive and look great on all screen sizes (mobile, tablet, desktop).
5.  **Placeholder Images:** Use placeholder images from \`https://placehold.co\` for any images. For example: \`https://placehold.co/600x400.png\`. Do not include any text on the placeholders.
6.  **Professional Design:** The design should be clean, modern, and visually appealing. Use a consistent color scheme and typography.
7.  **No Comments or Explanations:** Your output should ONLY be the raw HTML code. Do not include any markdown formatting, comments, or explanations before or after the code.

**User's Website Description:**
"{{{prompt}}}"

Generate the complete HTML code now.`,
});

const generateWebsiteFlow = ai.defineFlow(
  {
    name: 'generateWebsiteFlow',
    inputSchema: GenerateWebsiteInputSchema,
    outputSchema: GenerateWebsiteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
