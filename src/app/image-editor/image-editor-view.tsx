
'use client';

import { editImage } from '@/ai/flows/edit-image';
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
import { Download, Image as ImageIcon, Loader2, Wand2, Upload, Edit } from 'lucide-react';
import NextImage from 'next/image';
import { useState, type ChangeEvent, type FormEvent } from 'react';

export function ImageEditorView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile || !previewUrl || !prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an image and provide an editing prompt.',
      });
      return;
    }

    setIsLoading(true);
    setResultUrl('');

    try {
      const result = await editImage({ photoDataUri: previewUrl, prompt });
      setResultUrl(result.image);
    } catch (error) {
      console.error('Error editing image:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to edit the image. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Image Editor
        </h1>
        <p className="text-muted-foreground">
          Upload an image and edit it using a text prompt.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-6 w-6" /> Edit Panel
              </CardTitle>
              <CardDescription>
                Upload your image and describe the changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Upload Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt">Editing Prompt</Label>
                  <Input
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., make it look like a watercolor painting"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !imageFile || !prompt.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Apply Edits
                </Button>
              </form>
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
                {isLoading && !previewUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
                {!previewUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-12 w-12" />
                    <p>Upload an image to see it here</p>
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
                <Wand2 className="h-6 w-6 text-primary" /> Edited Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full rounded-lg border bg-muted flex items-center justify-center">
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Editing...</p>
                  </div>
                )}
                {!isLoading && !resultUrl && (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-12 w-12" />
                    <p>Your edited image will appear here</p>
                  </div>
                )}
                {resultUrl && (
                  <NextImage
                    src={resultUrl}
                    alt="Edited image"
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
                <a href={resultUrl} download="edited-image.png">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download Edited Image</span>
                </a>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
