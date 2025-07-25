'use server';
/**
 * @fileOverview A flow to generate chart data from a text prompt.
 *
 * - generateChart - A function that takes a text prompt and returns chart data.
 * - GenerateChartInput - The input type for the generateChart function.
 * - GenerateChartOutput - The return type for the generateChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChartInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the chart from.'),
});
export type GenerateChartInput = z.infer<typeof GenerateChartInputSchema>;

const ChartDataItemSchema = z.object({
  name: z.string().describe('The name of the data point (e.g., a month, a category).'),
  value: z.number().describe('The numerical value of the data point.'),
});

const GenerateChartOutputSchema = z.object({
  type: z
    .enum(['bar', 'line', 'pie'])
    .describe('The recommended type of chart.'),
  data: z
    .array(ChartDataItemSchema)
    .describe('The data to be displayed in the chart.'),
  title: z.string().describe('A suitable title for the chart.'),
  description: z.string().describe('A brief description of the chart.'),
});
export type GenerateChartOutput = z.infer<typeof GenerateChartOutputSchema>;

export async function generateChart(input: GenerateChartInput): Promise<GenerateChartOutput> {
  return generateChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChartPrompt',
  input: {schema: GenerateChartInputSchema},
  output: {schema: GenerateChartOutputSchema},
  prompt: `You are a data visualization expert. Based on the following prompt, generate the appropriate chart data.
  
  Determine the best chart type (bar, line, or pie) for the data.
  Provide a clear and concise title and a short description for the chart.
  The data should be an array of objects, each with a 'name' and a 'value'.

  Example: "Show monthly sales for Q1: Jan $4000, Feb $3000, Mar $5000"
  Should result in:
  - type: 'bar'
  - title: 'Monthly Sales for Q1'
  - description: 'A bar chart showing the total sales for each month in the first quarter.'
  - data: [{ name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 5000 }]

  Prompt: {{{prompt}}}`,
});

const generateChartFlow = ai.defineFlow(
  {
    name: 'generateChartFlow',
    inputSchema: GenerateChartInputSchema,
    outputSchema: GenerateChartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
