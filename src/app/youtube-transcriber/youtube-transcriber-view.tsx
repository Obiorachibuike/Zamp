
'use client';

import { getYouTubeTranscript, GetYouTubeTranscriptOutput } from '@/ai/flows/youtube-transcript';
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
import { Clipboard, Loader2, User, Youtube } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function YouTubeTranscriberView() {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState<GetYouTubeTranscriptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setTranscript(null);

    try {
      const result = await getYouTubeTranscript({ url });
      setTranscript(result);
    } catch (error: any) {
      console.error('Error getting transcript:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get the transcript. Please check the URL and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript.fullText);
    toast({
      title: 'Copied!',
      description: 'The full transcript has been copied to your clipboard.',
    });
  };
  
  const formatTimestamp = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          YouTube Transcriber
        </h1>
        <p className="text-muted-foreground">
          Get the transcript from any YouTube video.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> YouTube URL
              </CardTitle>
              <CardDescription>
                Paste the URL of the video you want to transcribe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="url">Video URL</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g., https://www.youtube.com/watch?v=..."
                    disabled={isLoading}
                    type="url"
                  />
                </div>
                <Button type="submit" disabled={isLoading || !url.trim()}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Get Transcript
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className='flex items-center gap-2'>
                    <Youtube className="h-6 w-6 text-primary" /> Transcript
                </span>
                {transcript && (
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy
                    </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] w-full rounded-lg border bg-muted p-4">
                {isLoading && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Fetching transcript...</p>
                  </div>
                )}
                {!isLoading && !transcript && (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Youtube className="h-12 w-12" />
                    <p className="text-center">The transcript will appear here.</p>
                  </div>
                )}
                 {transcript && transcript.transcript.length > 0 ? (
                  <div className="space-y-4">
                    {transcript.transcript.map((line, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <div className="font-mono text-xs text-muted-foreground">
                          {formatTimestamp(line.offset / 1000)}
                        </div>
                        <p className="flex-1">{line.text}</p>
                      </div>
                    ))}
                  </div>
                ) : !isLoading && transcript && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <p className="text-center">No transcript available for this video.</p>
                    </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
