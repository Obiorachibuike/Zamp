'use server';
/**
 * @fileOverview A flow to analyze the content of a document.
 *
 * - analyzeDocument - A function that takes a document and returns an analysis.
 * - AnalyzeDocumentInput - The input type for the analyzeDocument function.
 * - AnalyzeDocumentOutput - The return type for the analyzeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Supported types include images, PDFs, and text-based files."
    ),
});
export type AnalyzeDocumentInput = z.infer<typeof AnalyzeDocumentInputSchema>;

const AnalyzeDocumentOutputSchema = z.object({
  analysis: z.string().describe('A detailed explanation and summary of the document content.'),
});
export type AnalyzeDocumentOutput = z.infer<typeof AnalyzeDocumentOutputSchema>;

export async function analyzeDocument(input: AnalyzeDocumentInput): Promise<AnalyzeDocumentOutput> {
  return analyzeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: {schema: AnalyzeDocumentInputSchema},
  output: {schema: AnalyzeDocumentOutputSchema},
  prompt: `You are an expert document analyst. Your task is to provide a clear, concise, and comprehensive explanation of the provided document.

Analyze the content of the following document. If it's an image, describe it in detail. If it's a PDF or text document, summarize its key points, identify the main purpose, and extract any important information like names, dates, or figures.

Present your analysis in a structured and easy-to-read format.

Document: {{media url=documentDataUri}}`,
});

const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzeDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
