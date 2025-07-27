
'use server';
/**
 * @fileOverview A flow to generate and iteratively edit a single-page website from a text prompt.
 *
 * - generateWebsite - A function that takes a text prompt and returns HTML code.
 * - GenerateWebsiteInput - The input type for the generateWebsite function.
 * - GenerateWebsiteOutput - The return type for the generateWebsite function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWebsiteInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the website to be built or the changes to be made.'),
  existingHtml: z.string().optional().describe('The existing HTML code of the website to be modified. If this is the first request, this will be empty.'),
});
export type GenerateWebsiteInput = z.infer<typeof GenerateWebsiteInputSchema>;

export async function* generateWebsite(input: GenerateWebsiteInput) {
  for await (const chunk of generateWebsiteFlow(input)) {
    yield chunk;
  }
}

const prompt = ai.definePrompt({
  name: 'generateWebsitePrompt',
  input: {schema: GenerateWebsiteInputSchema},
  prompt: `You are an expert web developer specializing in creating beautiful, modern, and responsive single-page websites using HTML and Tailwind CSS.

Your task is to take a user's prompt and either generate a new website or modify an existing one. You should think about what a real user would want and create a full, professional-looking site.

**Initial Generation Requirements:**
1.  **Single HTML File:** The entire output must be a single, self-contained HTML file.
2.  **Tailwind CSS:** Use Tailwind CSS classes directly in the HTML. You must use the CDN link in the <head>: \`<script src="https://cdn.tailwindcss.com"></script>\`.
3.  **Content Sections:** Intelligently structure the website with logical sections appropriate for the user's request (e.g., Hero, Menu, About Us, Contact Form).
4.  **Placeholder Images:** Use placeholder images from \`https://placehold.co\` where images are needed (e.g., \`https://placehold.co/600x400.png\`). For each placeholder, add a \`data-ai-hint\` attribute containing one or two keywords describing the image (e.g., \`<img src="https://placehold.co/600x400.png" data-ai-hint="coffee beans">\`).
5.  **Inline SVG Icons:** Where appropriate, use inline SVG icons from a library like Lucide to enhance the design. Embed the full SVG code directly.

**Multi-Page Simulation (for both initial and follow-up requests):**
If the user requests multiple pages (e.g., "Home", "About", "Contact"), you must implement this within the single HTML file.
- Wrap each page's content in a main \`<section>\` with a \`data-page\` attribute (e.g., \`<section data-page="about" class="hidden">...</section>\`).
- The default page (usually "home") should be visible, all others should have the 'hidden' class by default.
- Navigation links should have an \`onclick\` attribute that calls a Javascript function, passing the target page name (e.g., \`<a href="#" onclick="showPage('about')">About</a>\`).
- Embed a \`<script>\` tag before the closing \`</body>\` tag with a Javascript function \`showPage(pageName)\` that:
    1. Selects all sections with a \`data-page\` attribute and adds the 'hidden' class to them.
    2. Selects the section where \`data-page\` matches the \`pageName\` and removes the 'hidden' class.

**Follow-up Edit Requirements:**
- If provided with "Existing HTML", you MUST modify it based on the new prompt. Do not regenerate from scratch.
- Analyze the user's request (e.g., "add a gallery section", "change the color scheme to blue") and apply the changes to the provided HTML.
- Ensure the final output is the complete, valid, modified HTML code.

**Output Format:**
Your output should ONLY be the raw HTML code. Do not include any markdown formatting, comments, or explanations before or after the code.

{{#if existingHtml}}
**This is an edit request. Modify the following HTML based on the user's new prompt.**

**User's New Request:**
"{{{prompt}}}"

**Existing HTML to Modify:**
\`\`\`html
{{{existingHtml}}}
\`\`\`

Generate the complete, updated HTML code now.
{{else}}
**This is an initial generation request.**

**User's Website Description:**
"{{{prompt}}}"

Generate the complete HTML code now.
{{/if}}
`,
});

const generateWebsiteFlow = ai.defineFlow(
  {
    name: 'generateWebsiteFlow',
    inputSchema: GenerateWebsiteInputSchema,
    stream: { schema: z.string() },
  },
  async function* (input) {
    const {stream} = await ai.generate({
      prompt: prompt.compile({input: input}),
      stream: true,
    });
    for await (const chunk of stream) {
      yield chunk.text();
    }
  }
);

