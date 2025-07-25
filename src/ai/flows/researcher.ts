'use server';
/**
 * @fileOverview A flow to research a topic and provide a summary and links.
 *
 * - researchTopic - A function that takes a topic and returns a summary and links.
 * - ResearchTopicInput - The input type for the researchTopic function.
 * - ResearchTopicOutput - The return type for the researchTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResearchTopicInputSchema = z.object({
  topic: z.string().describe('The topic to research.'),
});
export type ResearchTopicInput = z.infer<typeof ResearchTopicInputSchema>;

const LinkSchema = z.object({
  title: z.string().describe('The title of the web page.'),
  url: z.string().url().describe('The URL of the web page.'),
  snippet: z.string().describe('A short snippet or description of the content.'),
});

const ResearchTopicOutputSchema = z.object({
  summary: z.string().describe('A detailed summary of the research topic.'),
  links: z.array(LinkSchema).describe('A list of relevant links with titles and snippets.'),
});
export type ResearchTopicOutput = z.infer<typeof ResearchTopicOutputSchema>;

export async function researchTopic(input: ResearchTopicInput): Promise<ResearchTopicOutput> {
  return researcherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'researcherPrompt',
  input: {schema: ResearchTopicInputSchema},
  output: {schema: ResearchTopicOutputSchema},
  prompt: `You are an expert researcher. Your task is to provide a comprehensive summary and a list of relevant links for the given topic.

Topic: {{{topic}}}

Please provide a detailed summary of the topic.
Then, provide a list of at least 5 relevant and reputable web links. For each link, include a title, the full URL, and a brief snippet describing the content of the page.`,
});

const researcherFlow = ai.defineFlow(
  {
    name: 'researcherFlow',
    inputSchema: ResearchTopicInputSchema,
    outputSchema: ResearchTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
