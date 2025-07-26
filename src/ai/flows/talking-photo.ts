
'use server';
/**
 * @fileOverview A flow to generate a talking photo from an image and text.
 *
 * - generateTalkingPhoto - A function that takes an image and text, and returns an animated video and audio.
 * - GenerateTalkingPhotoInput - The input type for the generateTalkingPhoto function.
 * - GenerateTalkingPhotoOutput - The return type for the generateTalkingPhoto function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

const GenerateTalkingPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a character, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  text: z.string().describe('The text the character should speak.'),
});
export type GenerateTalkingPhotoInput = z.infer<
  typeof GenerateTalkingPhotoInputSchema
>;

const GenerateTalkingPhotoOutputSchema = z.object({
  video: z
    .string()
    .describe(
      'The generated animated video as a data URI that must include a MIME type and use Base64 encoding.'
    ),
  audio: z
    .string()
    .describe(
      'The generated audio as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type GenerateTalkingPhotoOutput = z.infer<
  typeof GenerateTalkingPhotoOutputSchema
>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function generateTalkingPhoto(
  input: GenerateTalkingPhotoInput
): Promise<GenerateTalkingPhotoOutput> {
  return generateTalkingPhotoFlow(input);
}

const generateTalkingPhotoFlow = ai.defineFlow(
  {
    name: 'generateTalkingPhotoFlow',
    inputSchema: GenerateTalkingPhotoInputSchema,
    outputSchema: GenerateTalkingPhotoOutputSchema,
  },
  async ({photoDataUri, text}) => {
    // Estimate video duration: 4 words per second, with a minimum of 3 seconds.
    const wordCount = text.split(/\s+/).length;
    const durationSeconds = Math.max(3, Math.ceil(wordCount / 4));

    // Kick off both AI calls in parallel
    const videoPromise = ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: [
        {media: {url: photoDataUri}},
        {
          text: `Make the character in the image talk as if they are speaking. The animation should be subtle and focused on the face and mouth movements.`,
        },
      ],
      config: {
        durationSeconds,
        personGeneration: 'allow_adult',
      },
    });

    const audioPromise = ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      prompt: text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
    });

    // Await both promises
    const [videoResult, audioResult] = await Promise.all([
      videoPromise,
      audioPromise,
    ]);

    // Process video result
    let {operation} = videoResult;
    if (!operation) {
      throw new Error('Expected the video model to return an operation');
    }
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    if (operation.error) {
      throw new Error('Failed to generate video: ' + operation.error.message);
    }
    const videoPart = operation.output?.message?.content.find(p => !!p.media);
    if (!videoPart || !videoPart.media) {
      throw new Error('Failed to find the generated video');
    }
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
      `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`
    );
    if (!videoDownloadResponse.ok) {
      throw new Error(`Failed to download video: ${videoDownloadResponse.statusText}`);
    }
    const videoBuffer = await videoDownloadResponse.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString('base64');
    const videoDataUri = `data:video/mp4;base64,${videoBase64}`;
    
    // Process audio result
    const {media: audioMedia} = audioResult;
     if (!audioMedia) {
      throw new Error('no media returned from TTS');
    }
    const audioBuffer = Buffer.from(
      audioMedia.url.substring(audioMedia.url.indexOf(',') + 1),
      'base64'
    );
    const wavData = await toWav(audioBuffer);
    const audioDataUri = `data:audio/wav;base64,${wavData}`;

    return {
      video: videoDataUri,
      audio: audioDataUri,
    };
  }
);
