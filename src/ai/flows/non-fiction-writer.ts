
'use server';
/**
 * @fileOverview A flow to write non-fiction content by section.
 *
 * - generateNonFictionOutline - Generates the structure and outline.
 * - writeNonFictionSection - Writes the content for a single section.
 * - generateNonFictionCover - Generates a book cover image.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NonFictionGenreEnum = z.enum(['Self-help', 'Personal Development', 'Motivational', 'Business / Success', 'Psychology (Applied / Popular)', 'General Non-fiction']);
export type NonFictionGenre = z.infer<typeof NonFictionGenreEnum>;

// Schema for generating the outline
const NonFictionOutlineInputSchema = z.object({
  topic: z.string().describe('The main topic or thesis of the non-fiction work.'),
  genre: NonFictionGenreEnum.describe('The genre of the work.'),
  numSections: z.number().int().min(1).max(50).describe('The desired number of sections or chapters.'),
  targetAudience: z.string().optional().describe('A brief description of the target audience.'),
});
export type NonFictionOutlineInput = z.infer<typeof NonFictionOutlineInputSchema>;

const SectionOutlineSchema = z.object({
    title: z.string().describe('The title of the section/chapter.'),
    description: z.string().describe('A brief one-sentence description of the key points covered in this section.'),
});

const NonFictionOutlineOutputSchema = z.object({
  title: z.string().describe('A compelling title for the work.'),
  introduction: z.string().describe('A brief (1-2 paragraph) introduction to the topic.'),
  sections: z.array(SectionOutlineSchema).describe('The list of sections with their titles and descriptions.'),
  conclusion: z.string().describe('A brief (1-2 paragraph) conclusion summarizing the key takeaways.'),
});
export type NonFictionOutlineOutput = z.infer<typeof NonFictionOutlineOutputSchema>;

// Schema for writing a single section
const WriteNonFictionSectionInputSchema = z.object({
    topic: z.string().describe('The original topic for the work.'),
    genre: NonFictionGenreEnum.describe('The genre of the work.'),
    fullOutline: NonFictionOutlineOutputSchema.describe('The full outline of the work.'),
    sectionIndex: z.number().int().describe('The index of the section to write.'),
});
export type WriteNonFictionSectionInput = z.infer<typeof WriteNonFictionSectionInputSchema>;

const WriteNonFictionSectionOutputSchema = z.object({
    sectionContent: z.string().describe('The full text content of the section.'),
});
export type WriteNonFictionSectionOutput = z.infer<typeof WriteNonFictionSectionOutputSchema>;

// Schema for generating a book cover
const GenerateNonFictionCoverInputSchema = z.object({
    title: z.string().describe('The title of the book.'),
    description: z.string().describe('The description or introduction of the book.'),
    genre: NonFictionGenreEnum.describe('The genre of the work.'),
});
export type GenerateNonFictionCoverInput = z.infer<typeof GenerateNonFictionCoverInputSchema>;

const GenerateNonFictionCoverOutputSchema = z.object({
  image: z
    .string()
    .describe(
      'The generated book cover image as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type GenerateNonFictionCoverOutput = z.infer<typeof GenerateNonFictionCoverOutputSchema>;


// Flow Functions
export async function generateNonFictionOutline(input: NonFictionOutlineInput): Promise<NonFictionOutlineOutput> {
  return generateNonFictionOutlineFlow(input);
}

export async function writeNonFictionSection(input: WriteNonFictionSectionInput): Promise<WriteNonFictionSectionOutput> {
  return writeNonFictionSectionFlow(input);
}

export async function generateNonFictionCover(input: GenerateNonFictionCoverInput): Promise<GenerateNonFictionCoverOutput> {
    return generateNonFictionCoverFlow(input);
}

// Genkit Definitions

const generateNonFictionOutlineFlow = ai.defineFlow(
  {
    name: 'generateNonFictionOutlineFlow',
    inputSchema: NonFictionOutlineInputSchema,
    outputSchema: NonFictionOutlineOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'nonFictionOutlinePrompt',
      input: { schema: NonFictionOutlineInputSchema },
      output: { schema: NonFictionOutlineOutputSchema },
      prompt: `You are an expert author of non-fiction books. A user wants to write a new book.
      
      Based on their request, generate a compelling title, a short introduction, a short conclusion, and an outline for a book with {{{numSections}}} sections. 
      For each section in the outline, provide a title and a brief one-sentence description of the key points.

      The book's genre is '{{{genre}}}'.
      The target audience is: {{{targetAudience}}}.

      Main Topic: {{{topic}}}
      `,
    });
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate outline.');
    }
    return output;
  }
);

const writeNonFictionSectionFlow = ai.defineFlow(
  {
    name: 'writeNonFictionSectionFlow',
    inputSchema: WriteNonFictionSectionInputSchema,
    outputSchema: WriteNonFictionSectionOutputSchema,
  },
  async (input) => {
    const sectionToWrite = input.fullOutline.sections[input.sectionIndex];
    
    const prompt = ai.definePrompt({
      name: 'nonFictionWriteSectionPrompt',
      output: { schema: WriteNonFictionSectionOutputSchema },
      prompt: `You are an expert author of non-fiction books. Write a full, detailed section for a book.
      
      Your writing style should be clear, informative, and engaging for the target audience. Use well-structured paragraphs.

      The book's genre is: ${input.genre}.
      The main topic is: ${input.topic}
      
      The overall introduction for context is: ${input.fullOutline.introduction}
      
      You are now writing Section ${input.sectionIndex + 1}: "${sectionToWrite.title}".
      Section Description: ${sectionToWrite.description}

      Write only the section content, without any titles or introductory phrases like "Section X". The content should be comprehensive and directly address the section's description.
      `,
    });

    const { output } = await prompt({});
    return output!;
  }
);

const generateNonFictionCoverFlow = ai.defineFlow(
    {
        name: 'generateNonFictionCoverFlow',
        inputSchema: GenerateNonFictionCoverInputSchema,
        outputSchema: GenerateNonFictionCoverOutputSchema,
    },
    async (input) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: `Generate a professional, abstract book cover for a non-fiction book titled "${input.title}". 
            The book is in the "${input.genre}" genre.
            
            Book Description: ${input.description}.
            
            The cover should be visually appealing, modern, and suitable for the genre. It should hint at the book's main themes. 
            Do not include any text or titles on the image itself.`,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });

        return { image: media.url! };
    }
);
