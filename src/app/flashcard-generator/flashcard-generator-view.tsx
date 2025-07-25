
'use client';

import {
  generateFlashcards,
  type GenerateFlashcardsOutput,
} from '@/ai/flows/flashcard-generator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    Clipboard,
  Copy,
  FlipHorizontal,
  Lightbulb,
  Loader2,
  User,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';

export function FlashcardGeneratorView() {
  const [text, setText] = useState('');
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [flashcardData, setFlashcardData] =
    useState<GenerateFlashcardsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setFlashcardData(null);

    try {
      const result = await generateFlashcards({ text, numFlashcards });
      setFlashcardData(result);
      setFlippedStates(new Array(result.flashcards.length).fill(false));
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the flashcards. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = (index: number) => {
    setFlippedStates((prev) => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleCopy = () => {
    if (!flashcardData) return;
    const flashcardText = flashcardData.flashcards
      .map((fc) => `${fc.term}\t${fc.definition}`)
      .join('\n');
    navigator.clipboard.writeText(flashcardText);
    toast({
      title: 'Copied!',
      description: 'Flashcards copied to clipboard (tab-separated).',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Flashcard Generator
        </h1>
        <p className="text-muted-foreground">
          Create study flashcards from any text.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Text
              </CardTitle>
              <CardDescription>
                Paste the text you want to create flashcards from.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-to-flashcards">Source Text</Label>
                  <Textarea
                    id="text-to-flashcards"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your study notes or an article here..."
                    className="h-64 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num-flashcards">
                    Number of Flashcards: {numFlashcards}
                  </Label>
                  <Slider
                    id="num-flashcards"
                    min={1}
                    max={50}
                    step={1}
                    value={[numFlashcards]}
                    onValueChange={(value) => setNumFlashcards(value[0])}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !text.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Flashcards
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Copy className="h-6 w-6 text-primary" />{' '}
                  {flashcardData?.title || 'Generated Flashcards'}
                </span>
                {flashcardData && (
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy All
                    </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] w-full rounded-lg border bg-muted p-4">
                {isLoading && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Generating flashcards...</p>
                  </div>
                )}
                {!isLoading && !flashcardData && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Lightbulb className="h-12 w-12" />
                    <p>Your flashcards will appear here</p>
                  </div>
                )}
                {flashcardData && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {flashcardData.flashcards.map((fc, i) => (
                      <div
                        key={i}
                        className={cn(
                          'group relative aspect-[3/2] cursor-pointer rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-transform duration-500 [transform-style:preserve-3d]',
                          flippedStates[i] && '[transform:rotateY(180deg)]'
                        )}
                        onClick={() => handleFlip(i)}
                      >
                        <div className="flex h-full flex-col items-center justify-center text-center [backface-visibility:hidden]">
                          <p className="text-sm font-semibold">{fc.term}</p>
                        </div>
                        <div className="absolute inset-0 flex h-full flex-col items-center justify-center rounded-lg bg-card p-4 text-center text-card-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]">
                          <p className="text-sm">{fc.definition}</p>
                        </div>
                        <FlipHorizontal className="absolute bottom-2 right-2 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
