
'use client';

import { captionImage } from '@/ai/flows/caption-image';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Image as ImageIcon, Loader2, Type, User } from 'lucide-react';
import NextImage from 'next/image';
import { useState, type ChangeEvent, type FormEvent } from 'react';

export function ImageCaptioningView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile || !previewUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an image file.',
      });
      return;
    }

    setIsLoading(true);
    setCaption('');

    try {
      const result = await captionImage({ photoDataUri: previewUrl });
      setCaption(result.caption);
    } catch (error) {
      console.error('Error captioning image:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate caption. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    toast({
      title: 'Copied!',
      description: 'The caption has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Image Captioning
        </h1>
        <p className="text-muted-foreground">
          Generate a descriptive caption for your image.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col-reverse">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Image
              </CardTitle>
              <CardDescription>
                Upload an image to generate a caption.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                {previewUrl && (
                  <div className="mt-4">
                     <NextImage
                      src={previewUrl}
                      alt="Image preview"
                      width={512}
                      height={512}
                      className="rounded-lg object-contain"
                    />
                  </div>
                )}
                <Button type="submit" disabled={isLoading || !imageFile}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Caption
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-6 w-6 text-primary" /> Generated Caption
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p>Generating caption...</p>
                </div>
              )}
               {!isLoading && !caption && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
                    <Type className="h-12 w-12" />
                    <p className="mt-2">Your caption will appear here</p>
                </div>
                )}
              {caption && (
                  <Textarea
                    value={caption}
                    readOnly
                    className="h-48 resize-none bg-muted/50"
                  />
              )}
            </CardContent>
            {caption && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy caption</span>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
