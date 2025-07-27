
'use client';

import { analyzeDocument } from '@/ai/flows/document-analyzer';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  File,
  Loader2,
  Upload,
  BrainCircuit,
  Clipboard,
} from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

export function DocumentAnalyzerView() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      setAnalysis('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!documentFile || !previewUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a document to analyze.',
      });
      return;
    }

    setIsLoading(true);
    setAnalysis('');

    try {
      const result = await analyzeDocument({ documentDataUri: previewUrl });
      setAnalysis(result.analysis);
    } catch (error: any) {
      console.error('Error analyzing document:', error);
      let description = 'Failed to analyze the document. Please try again.';
      if (error.message.includes('media')) {
        description = 'The file type may not be supported for analysis. Please try a different file (e.g., PDF, JPG, PNG).';
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
    navigator.clipboard.writeText(analysis);
    toast({
      title: 'Copied!',
      description: 'The analysis has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Document Analyzer
        </h1>
        <p className="text-muted-foreground">
          Upload any document to get an AI-powered explanation of its content.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-6 w-6" /> Upload Document
              </CardTitle>
              <CardDescription>
                Select a file from your device to analyze. Supports PDF, images,
                and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-upload">Document File</Label>
                  <Input
                    id="document-upload"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !documentFile}
                  className="w-full"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Analyze Document
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>File Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
                {!previewUrl && (
                  <div className="text-center text-muted-foreground">
                    <File className="mx-auto h-12 w-12" />
                    <p>Upload a file to see a preview</p>
                  </div>
                )}
                {previewUrl && documentFile?.type.startsWith('image/') && (
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
                {previewUrl && documentFile?.type === 'application/pdf' && (
                  <iframe
                    src={previewUrl}
                    className="h-full w-full"
                    title="PDF Preview"
                  />
                )}
                {previewUrl &&
                  !documentFile?.type.startsWith('image/') &&
                  documentFile?.type !== 'application/pdf' && (
                    <div className="text-center text-muted-foreground p-4">
                      <File className="mx-auto h-12 w-12" />
                      <p className="mt-2 font-semibold">{documentFile?.name}</p>
                      <p className="text-sm">
                        No preview available for this file type.
                      </p>
                      <Button asChild variant="link" size="sm">
                        <a
                          href={previewUrl}
                          download={documentFile?.name}
                        >
                          Download file
                        </a>
                      </Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BrainCircuit className="h-6 w-6 text-primary" /> AI Analysis
                </span>
                {analysis && (
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Clipboard className="h-4 w-4" />
                    <span className="sr-only">Copy analysis</span>
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                The AI's understanding of the document will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
              <ScrollArea className="h-[calc(100vh-22rem)] w-full rounded-lg border bg-muted p-4">
                {isLoading && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Analyzing document...</p>
                  </div>
                )}
                {!isLoading && !analysis && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <BrainCircuit className="h-12 w-12" />
                    <p className="text-center">
                      Upload a document and click "Analyze" to see the results.
                    </p>
                  </div>
                )}
                {analysis && (
                  <p className="whitespace-pre-wrap text-sm">{analysis}</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
