
'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Image as ImageIcon,
  Loader2,
  GalleryVertical,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import NextImage from 'next/image';
import { useState, type ChangeEvent, type FormEvent } from 'react';

export function LinkedInHeadshotGeneratorView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedHeadshot, setGeneratedHeadshot] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
        setGeneratedHeadshot('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!originalImageUrl) return;

    setIsLoading(true);
    setGeneratedHeadshot('');
    try {
      const result = await generateLinkedInHeadshot({
        photoDataUri: originalImageUrl,
        prompt,
      });

      setGeneratedHeadshot(result.image);
      toast({
        title: 'Success!',
        description: `Generated a professional headshot.`,
      });

    } catch (error: any) {
      console.error('Error generating headshot:', error);
      let description = 'Failed to generate a headshot. Please try again.';
      if (error.message && error.message.includes('500')) {
        description = 'The image processing service is currently unavailable. Please try again in a few moments.';
      } else if (error.message.includes('prompt was blocked')) {
        description = 'The request was blocked for safety reasons. Please try a different image.'
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getUniqueFilename = () => {
    const timestamp = new Date().getTime();
    return `headshot-${timestamp}.png`;
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          LinkedIn Headshot Generator
        </h1>
        <p className="text-muted-foreground">
          Upload a photo to create a professional headshot.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Input and instructions */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Upload Your Photo</CardTitle>
              <CardDescription>Upload a photo of yourself.</CardDescription>
            </CardHeader>
             <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
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
                   <div className="space-y-2">
                    <Label htmlFor="prompt">Optional Instructions</Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Use a light blue background..."
                      className="h-20 resize-none"
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading || !originalImageUrl}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Headshot
                  </Button>
                </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: Image display */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-6 w-6" /> Original Image
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
                        {!originalImageUrl ? (
                        <div className="text-center text-muted-foreground">
                            <ImageIcon className="mx-auto h-12 w-12" />
                            <p>Image Preview</p>
                        </div>
                        ) : (
                        <NextImage
                            src={originalImageUrl}
                            alt="Original"
                            width={512}
                            height={512}
                            className="object-contain rounded-lg"
                        />
                        )}
                    </div>
                 </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" /> Generated Headshot
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
                        {isLoading && (
                            <div className="flex justify-center items-center">
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-12 w-12 animate-spin" />
                                    <p>Creating headshot...</p>
                                </div>
                            </div>
                        )}
                        {!isLoading && !generatedHeadshot && (
                             <div className="text-center text-muted-foreground">
                                <Briefcase className="mx-auto h-12 w-12" />
                                <p>Your headshot will appear here.</p>
                            </div>
                        )}
                        {generatedHeadshot && (
                            <NextImage
                                src={generatedHeadshot}
                                alt="Generated headshot"
                                width={512}
                                height={512}
                                className="object-cover rounded-lg"
                            />
                        )}
                    </div>
                 </CardContent>
                 {generatedHeadshot && (
                    <CardFooter>
                         <Button asChild className="w-full">
                            <a href={generatedHeadshot} download={getUniqueFilename()}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                    </CardFooter>
                 )}
            </Card>
        </div>
      </div>
    </div>
  );
}
