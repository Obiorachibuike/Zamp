
'use server';
/**
 * @fileOverview A flow to write stories chapter by chapter and generate a book cover.
 *
 * - generateTableOfContents - Generates the plot and chapter list.
 * - writeChapter - Writes the content for a single chapter.
 * - generateBookCover - Generates a book cover image.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenreEnum = z.enum(['Sci-Fi', 'Fantasy', 'Romance', 'Mystery', 'Thriller']);

// Schema for generating the table of contents
const TableOfContentsInputSchema = z.object({
  prompt: z.string().describe('The basic idea or plot of the story.'),
  genre: GenreEnum.describe('The genre of the story.'),
  numChapters: z.number().int().min(1).max(100).describe('The desired number of chapters.'),
  wordsPerChapter: z.number().int().min(50).max(5000).describe('The approximate number of words per chapter.'),
});
export type TableOfContentsInput = z.infer<typeof TableOfContentsInputSchema>;

const ChapterOutlineSchema = z.object({
    title: z.string().describe('The title of the chapter.'),
    description: z.string().describe('A brief one-sentence description of what happens in this chapter.'),
});

const TableOfContentsOutputSchema = z.object({
  title: z.string().describe('A compelling title for the whole story or book.'),
  plotSummary: z.string().describe('A 2-3 paragraph summary of the entire plot.'),
  chapters: z.array(ChapterOutlineSchema).describe('The list of chapters with their titles and descriptions.'),
});
export type TableOfContentsOutput = z.infer<typeof TableOfContentsOutputSchema>;

// Schema for writing a single chapter
const WriteChapterInputSchema = z.object({
    prompt: z.string().describe('The original story prompt.'),
    genre: GenreEnum.describe('The genre of the story.'),
    tableOfContents: TableOfContentsOutputSchema.describe('The full table of contents and plot summary.'),
    chapterIndex: z.number().int().describe('The index of the chapter to write.'),
    wordsPerChapter: z.number().int().describe('The approximate number of words for this chapter.'),
    previousChapterContent: z.string().optional().describe('The content of the previous chapter to ensure continuity.'),
});
export type WriteChapterInput = z.infer<typeof WriteChapterInputSchema>;

const WriteChapterOutputSchema = z.object({
    chapterContent: z.string().describe('The full text content of the chapter.'),
});
export type WriteChapterOutput = z.infer<typeof WriteChapterOutputSchema>;


// Schema for generating a book cover
const GenerateBookCoverInputSchema = z.object({
    title: z.string().describe('The title of the book.'),
    summary: z.string().describe('The summary of the book plot.'),
    genre: GenreEnum.describe('The genre of the story.'),
});
export type GenerateBookCoverInput = z.infer<typeof GenerateBookCoverInputSchema>;

const GenerateBookCoverOutputSchema = z.object({
  image: z
    .string()
    .describe(
      'The generated book cover image as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type GenerateBookCoverOutput = z.infer<typeof GenerateBookCoverOutputSchema>;


// Flow Functions
export async function generateTableOfContents(input: TableOfContentsInput): Promise<TableOfContentsOutput> {
  return tableOfContentsFlow(input);
}

export async function writeChapter(input: WriteChapterInput): Promise<WriteChapterOutput> {
  return writeChapterFlow(input);
}

export async function generateBookCover(input: GenerateBookCoverInput): Promise<GenerateBookCoverOutput> {
  return generateBookCoverFlow(input);
}

// Genkit Definitions

const tableOfContentsFlow = ai.defineFlow(
  {
    name: 'tableOfContentsFlow',
    inputSchema: TableOfContentsInputSchema,
    outputSchema: TableOfContentsOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'storyTocPrompt',
      input: { schema: TableOfContentsInputSchema },
      output: { schema: TableOfContentsOutputSchema },
      prompt: `You are a master storyteller and novelist. A user wants to write a new book.
      
      Based on their prompt, generate a compelling book title, a detailed plot summary (2-3 paragraphs), and a table of contents for a book with {{{numChapters}}} chapters. Each chapter should be approximately {{{wordsPerChapter}}} words long. For each chapter in the table of contents, provide a title and a brief one-sentence description of the key events.

      The story should fit the '{{{genre}}}' genre.

      Story Prompt: {{{prompt}}}
      `,
    });
    const { output } = await prompt(input);
    return output!;
  }
);

const writeChapterFlow = ai.defineFlow(
  {
    name: 'writeChapterFlow',
    inputSchema: WriteChapterInputSchema,
    outputSchema: WriteChapterOutputSchema,
  },
  async (input) => {
    const chapterToWrite = input.tableOfContents.chapters[input.chapterIndex];
    const previousChapterContext = input.previousChapterContent
      ? `Here is the full text of the previous chapter. Ensure your writing is a direct and seamless continuation of these events:\n\n---\n\n${input.previousChapterContent}\n\n---`
      : 'This is the first chapter.';


    const prompt = ai.definePrompt({
      name: 'storyWriteChapterPrompt',
      output: { schema: WriteChapterOutputSchema },
      prompt: `You are a master storyteller and novelist. Write a full chapter for a book.
      
      Your writing style should be human-like, engaging, and natural. Vary your sentence structure and word choice to make the prose flow beautifully. Avoid robotic or repetitive phrasing. The chapter must contain between 5 and 10 paragraphs.

      The story's genre is: ${input.genre}.

      Original story prompt: ${input.prompt}
      
      Overall plot summary: ${input.tableOfContents.plotSummary}
      
      You are now writing Chapter ${input.chapterIndex + 1}: "${chapterToWrite.title}".
      Chapter Description: ${chapterToWrite.description}

      ${previousChapterContext}

      The chapter should be detailed, engaging, and approximately ${input.wordsPerChapter} words long. Write only the chapter content, without any titles or introductory phrases like "Chapter X".
      `,
    });

    const { output } = await prompt({});
    return output!;
  }
);


const generateBookCoverFlow = ai.defineFlow(
  {
    name: 'generateBookCoverFlow',
    inputSchema: GenerateBookCoverInputSchema,
    outputSchema: GenerateBookCoverOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a visually stunning and professional book cover for a book titled "${input.title}". The book is in the "${input.genre}" genre.
      
      The book's plot is as follows: ${input.summary}. 
      
      The cover should be dramatic and hint at the main themes of the story without using any text. The imagery should strongly evoke the genre. Do not include any text or titles on the image.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return { image: media.url! };
  }
);
