'use server';
/**
 * @fileOverview A flow to get the transcript from a YouTube video.
 *
 * - getYouTubeTranscript - A function that takes a video URL and returns the transcript.
 * - GetYouTubeTranscriptInput - The input type for the getYouTubeTranscript function.
 * - GetYouTubeTranscriptOutput - The return type for the getYouTubeTranscript function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { YouTubeTranscript } from 'youtube-transcript';

const GetYouTubeTranscriptInputSchema = z.object({
  url: z.string().url().describe('The URL of the YouTube video.'),
});
export type GetYouTubeTranscriptInput = z.infer<typeof GetYouTubeTranscriptInputSchema>;

const TranscriptLineSchema = z.object({
  text: z.string(),
  duration: z.number(),
  offset: z.number(),
});

const GetYouTubeTranscriptOutputSchema = z.object({
  transcript: z.array(TranscriptLineSchema).describe('The video transcript.'),
  fullText: z.string().describe('The full transcript as a single string.'),
});
export type GetYouTubeTranscriptOutput = z.infer<typeof GetYouTubeTranscriptOutputSchema>;

export async function getYouTubeTranscript(input: GetYouTubeTranscriptInput): Promise<GetYouTubeTranscriptOutput> {
  return getYouTubeTranscriptFlow(input);
}

const getYouTubeTranscriptFlow = ai.defineFlow(
  {
    name: 'getYouTubeTranscriptFlow',
    inputSchema: GetYouTubeTranscriptInputSchema,
    outputSchema: GetYouTubeTranscriptOutputSchema,
  },
  async (input) => {
    try {
      const transcript = await YouTubeTranscript.fetchTranscript(input.url);
      const fullText = transcript.map(line => line.text).join(' ');
      return { transcript, fullText };
    } catch (error: any) {
      console.error('Error fetching transcript:', error);
      // Re-throw a more user-friendly error
      if (error.message.includes('subtitles not found')) {
        throw new Error('Could not find a transcript for this video. It might be disabled for this video or is still being processed.');
      }
      throw new Error('An unexpected error occurred while fetching the transcript.');
    }
  }
);
