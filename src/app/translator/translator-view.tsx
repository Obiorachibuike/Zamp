
'use client';

import { translateText } from '@/ai/flows/translator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Languages, Loader2, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Chinese (Simplified)', label: 'Chinese (Simplified)' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Arabic', label: 'Arabic' },
];

export function TranslatorView() {
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setTranslatedText('');

    try {
      const result = await translateText({ text, targetLanguage });
      setTranslatedText(result.translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to translate the text. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    toast({
      title: 'Copied!',
      description: 'The translated text has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Real-time Translator
        </h1>
        <p className="text-muted-foreground">
          Translate text between different languages.
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
                Enter the text you want to translate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-to-translate">Text to Translate</Label>
                  <Textarea
                    id="text-to-translate"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text here..."
                    className="h-40 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="target-language">Translate to</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isLoading}>
                        <SelectTrigger id="target-language">
                            <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" disabled={isLoading || !text.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Translate
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-6 w-6 text-primary" /> Translated Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
                className="h-56 resize-none bg-muted/50"
              />
            </CardContent>
            {translatedText && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
                <span className="sr-only">Copy translated text</span>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
