'use client';

import { generateWebsite } from '@/ai/flows/website-builder';
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
import {
  Clipboard,
  Code2,
  Globe,
  Loader2,
  PenSquare,
  Eye,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function WebsiteBuilderView() {
  const [prompt, setPrompt] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    let accumulatedCode = htmlCode;
    if (!htmlCode) {
      setHtmlCode('');
    }

    try {
      const stream = generateWebsite({ prompt, existingHtml: htmlCode });

      let firstChunk = true;
      for await (const chunk of stream) {
        if (firstChunk) {
          accumulatedCode = '';
          firstChunk = false;
        }
        accumulatedCode += chunk;
        setHtmlCode(accumulatedCode);
      }
    } catch (error) {
      console.error('Error generating website:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the website. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleCopy = () => {
    if (!htmlCode) return;
    navigator.clipboard.writeText(htmlCode);
    toast({
      title: 'Copied!',
      description: 'The website HTML has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Website Builder
        </h1>
        <p className="text-muted-foreground">
          Generate or edit a responsive, single-page website from a text description.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenSquare className="h-6 w-6" /> Your Request
              </CardTitle>
              <CardDescription>
                {htmlCode 
                  ? "Describe the changes or new features you want to add."
                  : "Describe the single-page website you want to build. Be as detailed as possible."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    htmlCode
                      ? "e.g., Change the color theme to dark mode with blue accents."
                      : "e.g., A landing page for a modern coffee shop called 'Urban Grind'..."
                  }
                  className="h-64 resize-none"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="w-full"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {htmlCode ? 'Update Website' : 'Generate Website'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Tabs defaultValue="preview" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="preview">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code2 className="mr-2 h-4 w-4" />
                  Code
                </TabsTrigger>
              </TabsList>
              {htmlCode && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
              )}
            </div>
            <TabsContent value="preview">
              <Card className="mt-2">
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[70vh] w-full rounded-lg border bg-muted">
                    {isLoading && !htmlCode ? (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Building your website...</p>
                      </div>
                    ) : htmlCode ? (
                      <iframe
                        srcDoc={htmlCode}
                        title="Website Preview"
                        className="h-full w-full"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Globe className="h-12 w-12" />
                        <p className="text-center">
                          Your generated website preview will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="code">
              <Card className="mt-2">
                <CardHeader>
                  <CardTitle>HTML Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[70vh] w-full">
                    <pre className="h-full overflow-auto rounded-lg border bg-muted p-4">
                      <code className="text-sm font-code">
                        {isLoading && !htmlCode
                          ? 'Generating code...'
                          : htmlCode || 'HTML code will appear here.'}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}