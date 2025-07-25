
'use client';

import { changeTone } from '@/ai/flows/tone-changer';
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
import { Clipboard, Loader2, User, Wand } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const tones = [
  { value: 'Formal', label: 'Formal' },
  { value: 'Casual', label: 'Casual' },
  { value: 'Friendly', label: 'Friendly' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Humorous', label: 'Humorous' },
];

export function ToneChangerView() {
  const [text, setText] = useState('');
  const [tone, setTone] = useState('Formal');
  const [rewrittenText, setRewrittenText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setRewrittenText('');

    try {
      const result = await changeTone({ text, tone });
      setRewrittenText(result.rewrittenText);
    } catch (error) {
      console.error('Error changing tone:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to change the tone. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenText);
    toast({
      title: 'Copied!',
      description: 'The rewritten text has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Tone Changer
        </h1>
        <p className="text-muted-foreground">
          Rewrite your text in a different tone of voice.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Text
              </CardTitle>
              <CardDescription>
                Enter the text and select the desired tone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-to-change">Text</Label>
                  <Textarea
                    id="text-to-change"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g., The meeting is cancelled. Let's do it tomorrow."
                    className="h-40 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone-select">Target Tone</Label>
                  <Select
                    value={tone}
                    onValueChange={setTone}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="tone-select">
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isLoading || !text.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Change Tone
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand className="h-6 w-6 text-primary" /> Rewritten Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={rewrittenText}
                readOnly
                placeholder="The rewritten text will appear here..."
                className="h-56 resize-none bg-muted/50"
              />
            </CardContent>
            {rewrittenText && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy rewritten text</span>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
