
'use client';

import { generateSocialContent } from '@/ai/flows/social-content-generator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Loader2, User, Share2, ImageIcon, Download } from 'lucide-react';
import NextImage from 'next/image';
import { useState, type FormEvent } from 'react';

const platforms = [
  { value: 'Twitter', label: 'Twitter' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
];

export function SocialContentGeneratorView() {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('Twitter');
  const [generateImage, setGenerateImage] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setContent('');
    setImageUrl(null);

    try {
      const result = await generateSocialContent({
        prompt,
        platform,
        generateImage,
      });
      setContent(result.content);
      if (result.image) {
        setImageUrl(result.image);
      }
    } catch (error: any) {
      console.error('Error generating social content:', error);
      let description = 'Failed to generate the content. Please try again.';
      if (error.message && error.message.includes('500')) {
        description = 'The content generation service is currently unavailable. Please try again in a few moments.';
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

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'The social post has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Social Content Generator
        </h1>
        <p className="text-muted-foreground">
          Draft posts for various social media platforms, with optional AI-generated images.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Prompt
              </CardTitle>
              <CardDescription>
                Describe the post you want to create.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Announce a summer sale with a 20% discount."
                    className="h-28 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-select">Platform</Label>
                  <Select
                    value={platform}
                    onValueChange={setPlatform}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="platform-select">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="generate-image"
                    checked={generateImage}
                    onCheckedChange={setGenerateImage}
                    disabled={isLoading}
                  />
                  <Label htmlFor="generate-image">Generate Image</Label>
                </div>
                <Button type="submit" disabled={isLoading || !prompt.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Content
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-6 w-6 text-primary" /> Generated Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <Textarea
                        value={isLoading ? "Generating..." : content}
                        readOnly
                        placeholder="The generated social media post will appear here..."
                        className="h-40 resize-none bg-muted/50"
                    />
                     <div className="relative aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
                        {isLoading && generateImage && (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Generating image...</p>
                            </div>
                        )}
                        {!isLoading && !imageUrl && (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <ImageIcon className="h-12 w-12" />
                                <p>Generated image will appear here</p>
                            </div>
                        )}
                        {imageUrl && (
                            <NextImage
                                src={imageUrl}
                                alt="Generated social media image"
                                layout="fill"
                                className="rounded-lg object-cover"
                            />
                        )}
                        {imageUrl && (
                          <Button
                            asChild
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-2 z-10"
                          >
                            <a href={imageUrl} download="social-image.png">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download Image</span>
                            </a>
                          </Button>
                        )}
                    </div>
                </div>
              </CardContent>
              {content && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={handleCopy}
                >
                  <Clipboard className="h-4 w-4" />
                  <span className="sr-only">Copy content</span>
                </Button>
              )}
            </Card>
        </div>
      </div>
    </div>
  );
}
