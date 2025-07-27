
'use client';

import { generatePrompt } from '@/ai/flows/prompt-generator';
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
import { Clipboard, Loader2, User, PenLine, Wand2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const goals = [
  'Image Generation',
  'Creative Writing',
  'Code Snippet',
  'Email Draft',
  'Marketing Copy',
  'General Question',
];

export function PromptGeneratorView() {
  const [idea, setIdea] = useState('');
  const [goal, setGoal] = useState('Image Generation');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setIsLoading(true);
    setGeneratedPrompt('');

    try {
      const result = await generatePrompt({ idea, goal: goal as any });
      setGeneratedPrompt(result.generatedPrompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the prompt. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: 'Copied!',
      description: 'The generated prompt has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Prompt Generator
        </h1>
        <p className="text-muted-foreground">
          Expand a simple idea into a detailed and effective AI prompt.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenLine className="h-6 w-6" /> Your Idea
              </CardTitle>
              <CardDescription>
                Provide a basic idea and a goal for your prompt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idea">Basic Idea</Label>
                  <Textarea
                    id="idea"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="e.g., a logo for a coffee shop, or a function to sort an array"
                    className="h-28 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-select">Prompt Goal</Label>
                  <Select
                    value={goal}
                    onValueChange={setGoal}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="goal-select">
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isLoading || !idea.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Prompt
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-primary" /> Generated Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={isLoading ? "Generating..." : generatedPrompt}
                readOnly
                placeholder="Your detailed, enhanced prompt will appear here..."
                className="h-64 resize-none bg-muted/50"
              />
            </CardContent>
            {generatedPrompt && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy prompt</span>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
