
'use client';

import { generateLyrics } from '@/ai/flows/lyrics-generator';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Loader2, User, Music } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const genres = ['Pop', 'Rock', 'Hip-Hop', 'Country', 'Electronic', 'R&B', 'Folk', 'Metal'];

export function LyricsGeneratorView() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [lyrics, setLyrics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setLyrics('');

    try {
      const result = await generateLyrics({ prompt, genre: genre as any });
      setLyrics(result.lyrics);
    } catch (error) {
      console.error('Error generating lyrics:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate lyrics. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lyrics);
    toast({
      title: 'Copied!',
      description: 'The generated lyrics have been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Lyrics Generator
        </h1>
        <p className="text-muted-foreground">
          Create song lyrics from a topic and genre.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Song Idea
              </CardTitle>
              <CardDescription>
                Describe the song you want to write.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Song Topic</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A song about a road trip with old friends"
                    className="h-28 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre-select">Genre</Label>
                  <Select
                    value={genre}
                    onValueChange={setGenre}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="genre-select">
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isLoading || !prompt.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Lyrics
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-6 w-6 text-primary" /> Generated Lyrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={isLoading ? "Generating..." : lyrics}
                readOnly
                placeholder="Your generated song lyrics will appear here..."
                className="h-80 resize-none bg-muted/50"
              />
            </CardContent>
            {lyrics && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy lyrics</span>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
