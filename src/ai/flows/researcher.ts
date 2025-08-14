'use server';
/**
 * @fileOverview An AI researcher that summarizes a topic and finds relevant links.
 *
 * - researchTopic - A function that takes a topic and returns a summary and links.
 * - ResearchTopicInput - The input type for the researchTopic function.
 * - ResearchTopicOutput - The return type for the researchTopic function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ResearchTopicInputSchema = z.object({
  topic: z.string().describe('The topic to research.'),
});
export type ResearchTopicInput = z.infer<typeof ResearchTopicInputSchema>;

const LinkSchema = z.object({
  url: z.string().url().describe('The URL of the source.'),
  title: z.string().describe('The title of the source page.'),
  snippet: z.string().describe('A brief snippet from the source.'),
});

const ResearchTopicOutputSchema = z.object({
  summary: z.string().describe('A detailed summary of the research on the topic.'),
  links: z.array(LinkSchema).describe('A list of relevant links found during the research.'),
});
export type ResearchTopicOutput = z.infer<typeof ResearchTopicOutputSchema>;

export async function researchTopic(input: ResearchTopicInput): Promise<ResearchTopicOutput> {
  return researchTopicFlow(input);
}

const researchTopicFlow = ai.defineFlow(
  {
    name: 'researchTopicFlow',
    inputSchema: ResearchTopicInputSchema,
    outputSchema: ResearchTopicOutputSchema,
  },
  async ({topic}) => {
    const llmResponse = await ai.generate({
      model: 'gemini-1.5-flash',
      tools: [googleAI.googleSearch],
      prompt: `You are an expert researcher. Your task is to provide a comprehensive summary and a list of relevant links on the given topic.

      First, use the Google Search tool to find high-quality, relevant information about the topic: "${topic}".
      
      After reviewing the search results, synthesize the information into a detailed, multi-paragraph summary.
      
      Finally, provide a list of the top 3-5 most useful and relevant source links you used for the summary. For each link, include its title, URL, and a brief snippet.`,
    });

    // The model should call the tool and then generate the structured output.
    // We rely on the model's ability to follow instructions to format the output correctly.
    const output = llmResponse.output();
    if (!output || typeof output !== 'object' || !('summary' in output) || !('links' in output)) {
        throw new Error("The AI did not return the expected summary and links structure.");
    }

    return output as ResearchTopicOutput;
  }
);
