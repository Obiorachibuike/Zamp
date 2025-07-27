
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

Your task is to take a user's prompt and intelligently design and generate the complete HTML for a single-page website. You should think about what a real user would want and create a full, professional-looking site.

For example, if the user says "a site for a coffee shop," you should infer that it needs a hero section, a menu section, an 'about us' section, and a contact form.

**Requirements:**
1.  **Single HTML File:** The entire output must be a single, self-contained HTML file.
2.  **Tailwind CSS:** Use Tailwind CSS classes directly in the HTML for all styling. You must use the CDN link for Tailwind CSS in the <head> section: \`<script src="https://cdn.tailwindcss.com"></script>\`. Do not use any custom CSS or <style> blocks.
3.  **Content Sections:** Intelligently structure the website logically with clear sections appropriate for the user's request.
4.  **Placeholder Images:** Use placeholder images from \`https://placehold.co\` where images are needed (e.g., \`https://placehold.co/600x400.png\`). For each placeholder, add a \`data-ai-hint\` attribute containing one or two keywords describing the image that should be there (e.g., \`<img src="https://placehold.co/600x400.png" data-ai-hint="coffee beans">\`). This will help with generating images later. Do not include any text on the placeholders themselves.
5.  **Professional Design:** The design must be clean, modern, and visually appealing. Use a consistent and beautiful color scheme and typography.
6.  **Inline SVG Icons:** Where appropriate, use inline SVG icons from a library like Lucide to enhance the design (e.g., for feature lists, buttons). Embed the full SVG code directly into the HTML.
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
