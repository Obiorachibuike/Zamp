
'use client';

import { detectFaces } from '@/ai/flows/detect-faces';
import { generateLinkedInHeadshot } from '@/ai/flows/generate-linkedin-headshot';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Image as ImageIcon,
  Loader2,
  Briefcase,
  Users,
  ArrowRight,
} from 'lucide-react';
import NextImage from 'next/image';
import { useState, type ChangeEvent } from 'react';

type Stage = 'UPLOAD' | 'DETECTING' | 'SELECT_FACE' | 'GENERATING' | 'RESULT';

export function LinkedInHeadshotGeneratorView() {
  const [stage, setStage] = useState<Stage>('UPLOAD');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<{
    faceCount: number;
    annotatedImage: string;
  } | null>(null);
  const [generationInstruction, setGenerationInstruction] = useState('');
  const [finalHeadshot, setFinalHeadshot] = useState<string | null>(null);

  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
        setStage('UPLOAD');
        // Reset subsequent stages
        setDetectionResult(null);
        setFinalHeadshot(null);
        setGenerationInstruction('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectFaces = async () => {
    if (!originalImageUrl) return;
    setStage('DETECTING');
    try {
      const result = await detectFaces({ photoDataUri: originalImageUrl });
      setDetectionResult(result);
      setStage('SELECT_FACE');
      if (result.faceCount === 1) {
        setGenerationInstruction('the only person in the image');
      }
    } catch (error: any) {
      console.error('Error detecting faces:', error);
      toast({
        variant: 'destructive',
        title: 'Face Detection Failed',
        description:
          error.message ||
          'Could not process the image. Please try another one.',
      });
      setStage('UPLOAD');
    }
  };

  const handleGenerateHeadshot = async () => {
    if (!originalImageUrl) return;
    setStage('GENERATING');
    try {
      const result = await generateLinkedInHeadshot({
        photoDataUri: originalImageUrl,
        instructions: generationInstruction,
      });
      setFinalHeadshot(result.image);
      setStage('RESULT');
    } catch (error: any) {
      console.error('Error generating headshot:', error);
      let description = 'Failed to generate headshot. Please try again.';
      if (error.message && error.message.includes('500')) {
        description =
          'The image processing service is currently unavailable. Please try again in a few moments.';
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
      setStage('SELECT_FACE'); // Go back to selection stage on error
    }
  };

  const handleStartOver = () => {
    setStage('UPLOAD');
    setImageFile(null);
    setOriginalImageUrl(null);
    setDetectionResult(null);
    setFinalHeadshot(null);
    setGenerationInstruction('');
  };

  const getUniqueFilename = () => {
    const timestamp = new Date().getTime();
    return `headshot-${timestamp}.png`;
  };

  const isLoading = stage === 'DETECTING' || stage === 'GENERATING';

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          LinkedIn Headshot Generator
        </h1>
        <p className="text-muted-foreground">
          Upload a photo to create a professional headshot for your profile in a
          few steps.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Input and instructions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Upload Your Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="image-upload">Image File</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            {originalImageUrl && (
              <CardFooter>
                <Button onClick={handleDetectFaces} disabled={isLoading}>
                  {stage === 'DETECTING' && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Detect Faces
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>

          {detectionResult &&
            (stage === 'SELECT_FACE' ||
              stage === 'GENERATING' ||
              stage === 'RESULT') && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Identify the Subject</CardTitle>
                  <CardDescription>
                    {detectionResult.faceCount > 1
                      ? 'Tell the AI which person to use for the headshot.'
                      : 'We found one person in your photo. Ready to generate?'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {detectionResult.faceCount > 1 && (
                    <div className="space-y-2">
                      <Label htmlFor="instruction">Instructions</Label>
                      <Input
                        id="instruction"
                        value={generationInstruction}
                        onChange={(e) =>
                          setGenerationInstruction(e.target.value)
                        }
                        placeholder="e.g., 'the person on the left', 'the one in the red shirt'"
                        disabled={isLoading}
                      />
                    </div>
                  )}
                  {detectionResult.faceCount === 1 && (
                    <p className="text-sm text-muted-foreground">
                      Instruction has been pre-filled.
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleGenerateHeadshot}
                    disabled={isLoading || !generationInstruction}
                  >
                    {stage === 'GENERATING' && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate Headshot
                  </Button>
                </CardFooter>
              </Card>
            )}
        </div>

        {/* Right Column: Image display */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>
                {stage === 'UPLOAD' && 'Image Preview'}
                {stage === 'DETECTING' && 'Detecting Faces...'}
                {stage === 'SELECT_FACE' && 'Face Detection Result'}
                {stage === 'GENERATING' && 'Generating Headshot...'}
                {stage === 'RESULT' && 'Your Professional Headshot'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
                {/* Initial State */}
                {!originalImageUrl && (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p>Upload an image to start</p>
                  </div>
                )}

                {/* Loading states */}
                {(stage === 'DETECTING' || stage === 'GENERATING') && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>
                      {stage === 'DETECTING'
                        ? 'Analyzing photo...'
                        : 'Creating headshot...'}
                    </p>
                  </div>
                )}

                {/* Display logic */}
                {originalImageUrl && stage === 'UPLOAD' && (
                  <NextImage
                    src={originalImageUrl}
                    alt="Original image"
                    layout="fill"
                    className="object-contain rounded-lg"
                  />
                )}
                {detectionResult?.annotatedImage &&
                  (stage === 'SELECT_FACE' || stage === 'GENERATING') && (
                    <NextImage
                      src={detectionResult.annotatedImage}
                      alt="Annotated image with detected faces"
                      layout="fill"
                      className="object-contain rounded-lg"
                    />
                  )}
                {finalHeadshot && stage === 'RESULT' && (
                  <NextImage
                    src={finalHeadshot}
                    alt="Generated professional headshot"
                    layout="fill"
                    className="object-contain rounded-lg"
                  />
                )}
              </div>
            </CardContent>
            {finalHeadshot && stage === 'RESULT' && (
              <CardFooter className="flex-col gap-4">
                <Button asChild className="w-full">
                  <a href={finalHeadshot} download={getUniqueFilename()}>
                    <Download className="mr-2 h-4 w-4" /> Download Headshot
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleStartOver}
                >
                  Start Over
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
