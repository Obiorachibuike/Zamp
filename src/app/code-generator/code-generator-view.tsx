
'use client';

import { generateCode } from '@/ai/flows/generate-code';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clipboard, Code2, Loader2, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function CodeGeneratorView() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setCode('');

    try {
      const result = await generateCode({ prompt });
      setCode(result.code);
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: 'The generated code has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Code Generator
        </h1>
        <p className="text-muted-foreground">
          Generate code snippets from natural language.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Your Prompt
              </CardTitle>
              <CardDescription>
                Describe the code you want to generate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A python function to calculate the factorial of a number"
                  className="h-40 resize-none"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !prompt.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Code
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-6 w-6 text-primary" /> Generated Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="h-96 overflow-auto rounded-lg border bg-muted p-4">
                  <code className="text-sm font-code">
                    {isLoading ? 'Generating...' : code || 'Code will appear here.'}
                  </code>
                </pre>
                {code && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleCopy}
                  >
                    <Clipboard className="h-4 w-4" />
                    <span className="sr-only">Copy code</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
