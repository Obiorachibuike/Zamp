
'use client';

import { enhanceImage, type EnhanceImageInput } from '@/ai/flows/enhance-image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Image as ImageIcon, Loader2, Sparkles, Upload, Wand2 } from 'lucide-react';
import NextImage from 'next/image';
import { useState, type ChangeEvent } from 'react';

export function ImageEnhancerView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [isLoading, setIsLoading] = useState<EnhanceImageInput['enhancementType'] | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setResultUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhancement = async (enhancementType: EnhanceImageInput['enhancementType']) => {
    if (!imageFile || !previewUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an image file first.',
      });
      return;
    }

    setIsLoading(enhancementType);
    setResultUrl('');

    try {
      const result = await enhanceImage({ photoDataUri: previewUrl, enhancementType });
      setResultUrl(result.image);
    } catch (error: any) {
      console.error(`Error enhancing image (${enhancementType}):`, error);
      let description = 'Failed to enhance the image. Please try again.';
      if (error.message && error.message.includes('500')) {
        description = 'The image processing service is currently unavailable. Please try again in a few moments.';
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Image Enhancer
        </h1>
        <p className="text-muted-foreground">
          Deblur, colorize, and improve the quality of your images.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-6 w-6" /> Enhancement Panel
              </CardTitle>
              <CardDescription>
                Upload an image and choose an enhancement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Upload Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={!!isLoading}
                  />
                </div>
                <div className="space-y-2">
                   <Label>Enhancements</Label>
                   <div className="flex flex-col gap-2">
                     <Button onClick={() => handleEnhancement('deblur')} disabled={!!isLoading || !imageFile}>
                        {isLoading === 'deblur' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Deblur & Sharpen
                     </Button>
                      <Button onClick={() => handleEnhancement('colorize')} disabled={!!isLoading || !imageFile}>
                        {isLoading === 'colorize' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Colorize
                     </Button>
                      <Button onClick={() => handleEnhancement('enhance_quality')} disabled={!!isLoading || !imageFile}>
                        {isLoading === 'enhance_quality' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enhance Quality
                     </Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-6 w-6" /> Original Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
                {!previewUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-12 w-12" />
                    <p>Upload an image to start</p>
                  </div>
                )}
                {previewUrl && (
                  <NextImage
                    src={previewUrl}
                    alt="Original image"
                    width={512}
                    height={512}
                    className="rounded-lg object-contain"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" /> Enhanced Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
                {!!isLoading && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Enhancing...</p>
                  </div>
                )}
                {!isLoading && !resultUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-12 w-12" />
                    <p>Your enhanced image will appear here</p>
                  </div>
                )}
                {resultUrl && (
                  <NextImage
                    src={resultUrl}
                    alt="Enhanced image"
                    width={512}
                    height={512}
                    className="rounded-lg object-contain"
                  />
                )}
              </div>
            </CardContent>
            {resultUrl && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
              >
                <a href={resultUrl} download="enhanced-image.png">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download Enhanced Image</span>
                </a>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
