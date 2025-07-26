
'use client';

import {
  generateTableOfContents,
  writeChapter,
  generateBookCover,
  type TableOfContentsOutput,
} from '@/ai/flows/story-writer';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Download,
  ImageIcon,
  Loader2,
  PenSquare,
  Sparkles,
  BookImage,
  List,
  Eye,
  Volume2,
} from 'lucide-react';
import NextImage from 'next/image';
import { useState, type FormEvent, useMemo } from 'react';

type Stage = 'SETUP' | 'OUTLINE' | 'WRITING' | 'PREVIEW';

const genres = ['Sci-Fi', 'Fantasy', 'Romance', 'Mystery', 'Thriller', 'Horror', 'Adventure', 'Historical Fiction', 'Comedy', 'Dystopian', 'Young Adult'];

export function StoryWriterView() {
  // Setup State
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [numChapters, setNumChapters] = useState(5);
  const [wordsPerChapter, setWordsPerChapter] = useState(5000);
  
  // Data State
  const [stage, setStage] = useState<Stage>('SETUP');
  const [toc, setToc] = useState<TableOfContentsOutput | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [chapterContents, setChapterContents] = useState<Record<number, string>>({});
  const [bookCoverUrl, setBookCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  // Loading State
  const [isTocLoading, setIsTocLoading] = useState(false);
  const [isChapterLoading, setIsChapterLoading] = useState(false);
  const [isCoverLoading, setIsCoverLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const { toast } = useToast();

  const handleTocSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsTocLoading(true);
    setToc(null);
    setStage('SETUP');

    try {
      const result = await generateTableOfContents({ prompt, genre, numChapters, wordsPerChapter });
      setToc(result);
      setStage('OUTLINE');
    } catch (error) {
      console.error('Error generating table of contents:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the story outline. Please try again.',
      });
    } finally {
      setIsTocLoading(false);
    }
  };

  const startOrResumeWriting = async () => {
    setStage('WRITING');
    // If no chapters are written, load the first one. Otherwise, go to the current one.
    if (Object.keys(chapterContents).length === 0) {
        loadChapter(0);
    } else {
        // No action needed, will already be on current chapter
    }
  };

  const loadChapter = async (chapterIndex: number) => {
    if (!toc) return;

    // If chapter is already generated, just switch to it.
    if(chapterContents[chapterIndex]) {
        setCurrentChapter(chapterIndex);
        return;
    }
    
    setIsChapterLoading(true);
    setCurrentChapter(chapterIndex);

    try {
        const previousChapterContent = chapterContents[chapterIndex - 1];
        const result = await writeChapter({ prompt, genre, tableOfContents: toc, chapterIndex, wordsPerChapter, previousChapterContent });
        setChapterContents((prev) => ({...prev, [chapterIndex]: result.chapterContent}));
    } catch (error) {
        console.error('Error writing chapter:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Failed to write Chapter ${chapterIndex + 1}. Please try again.`,
        });
    } finally {
        setIsChapterLoading(false);
    }
  };
  
  const handleGenerateCover = async () => {
    if(!toc) return;
    setIsCoverLoading(true);
    setBookCoverUrl('');
    try {
      const result = await generateBookCover({ title: toc.title, summary: toc.plotSummary, genre: genre as any });
      setBookCoverUrl(result.image);
    } catch (error) {
       console.error('Error generating book cover:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to generate book cover. Please try again.',
        });
    } finally {
        setIsCoverLoading(false);
    }
  };
  
  const handleTitleSelect = (newTitle: string) => {
      if (toc) {
          setToc({...toc, title: newTitle});
          toast({ title: "Title Updated", description: `Your story's title is now "${newTitle}".` });
      }
  };
  
  const hasStartedWriting = Object.keys(chapterContents).length > 0;
  const allChaptersWritten = toc ? Object.keys(chapterContents).length === toc.chapters.length : false;

  const fullStoryText = useMemo(() => {
    if (!toc || !allChaptersWritten) return '';
    const storyParts = [
      `Title: ${toc.title}`,
      `Plot Summary: ${toc.plotSummary}`,
    ];
    toc.chapters.forEach((chapter, index) => {
      storyParts.push(`Chapter ${index + 1}: ${chapter.title}`);
      storyParts.push(chapterContents[index] || '');
    });
    return storyParts.join('\n\n');
  }, [toc, chapterContents, allChaptersWritten]);

  const handleDownloadStory = () => {
    if (!toc) return;

    const storyParts = [];
    storyParts.push(`Title: ${toc.title}\n\n`);
    storyParts.push(`Genre: ${genre}\n\n`);
    storyParts.push(`Plot Summary:\n${toc.plotSummary}\n\n`);
    storyParts.push(`--- Table of Contents ---\n`);
    toc.chapters.forEach((chapter, index) => {
        storyParts.push(`${index + 1}. ${chapter.title}`);
        storyParts.push(`   ${chapter.description}`);
    });
    storyParts.push('\n\n');


    toc.chapters.forEach((chapter, index) => {
      storyParts.push(`--- Chapter ${index + 1}: ${chapter.title} ---\n\n`);
      storyParts.push(chapterContents[index] || '(Content not generated)');
      storyParts.push('\n\n');
    });

    const fullStory = storyParts.join('');
    const blob = new Blob([fullStory], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${toc.title.replace(/ /g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleReadAloud = async () => {
    if (!fullStoryText) return;
    setIsAudioLoading(true);
    setAudioUrl('');
    try {
      const result = await textToSpeech({ text: fullStoryText });
      setAudioUrl(result.audio);
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        variant: 'destructive',
        title: 'Error generating audio',
        description: 'Failed to create the audio for the story. Please try again.',
      });
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Story Writer
        </h1>
        <p className="text-muted-foreground">
          Generate a complete story from a simple prompt, chapter by chapter.
        </p>
      </header>

      {stage === 'SETUP' && (
        <Card>
          <CardHeader>
            <CardTitle>1. Story Setup</CardTitle>
            <CardDescription>
              Provide the basic idea for your story and its structure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTocSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Story Prompt / Default Title</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A young wizard discovers a hidden prophecy that changes her destiny."
                  className="h-24 resize-none"
                  disabled={isTocLoading}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="genre-select">Genre</Label>
                    <Select
                        value={genre}
                        onValueChange={setGenre}
                        disabled={isTocLoading}
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
                 <div className="space-y-2">
                  <Label htmlFor="num-chapters">
                    Number of Chapters: {numChapters}
                  </Label>
                  <Slider
                    id="num-chapters"
                    min={1} max={25} step={1}
                    value={[numChapters]}
                    onValueChange={(v) => setNumChapters(v[0])}
                    disabled={isTocLoading}
                  />
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="words-per-chapter">
                    Words per Chapter (approx.): {wordsPerChapter}
                  </Label>
                  <Slider
                    id="words-per-chapter"
                    min={100} max={5000} step={50}
                    value={[wordsPerChapter]}
                    onValueChange={(v) => setWordsPerChapter(v[0])}
                    disabled={isTocLoading}
                  />
                </div>
              <Button type="submit" disabled={isTocLoading || !prompt.trim()}>
                {isTocLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Outline & Titles
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {stage === 'OUTLINE' && toc && (
        <Card>
            <CardHeader>
                <CardTitle>2. Story Outline & Cover</CardTitle>
                <CardDescription>
                    Review the generated plot and chapter outline. You can also generate a book cover.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <div>
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <h3 className="font-bold text-lg">{toc.title}</h3>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Title Suggestions</Label>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {toc.suggestedTitles.map((title, index) => (
                                <Button key={index} variant="outline" size="sm" onClick={() => handleTitleSelect(title)}>
                                    {title}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Plot Summary</Label>
                        <p className="text-sm text-muted-foreground italic pt-2">{toc.plotSummary}</p>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground">Chapters</Label>
                        <div className="space-y-2 pt-2">
                            {toc.chapters.map((chapter, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <span className="font-bold">{index + 1}.</span>
                                    <div>
                                        <p className="font-semibold">{chapter.title}</p>
                                        <p className="text-muted-foreground">{chapter.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <Card className="relative">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookImage className="h-5 w-5 text-primary"/>
                                Book Cover
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-[2/3] w-full rounded-lg border bg-muted flex items-center justify-center">
                            {isCoverLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
                            {!isCoverLoading && !bookCoverUrl && <ImageIcon className="h-12 w-12 text-muted-foreground" />}
                            {bookCoverUrl && <NextImage src={bookCoverUrl} alt="Generated book cover" layout="fill" className="rounded-lg object-cover" />}
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button onClick={handleGenerateCover} disabled={isCoverLoading} className="w-full">
                                {isCoverLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {bookCoverUrl ? 'Regenerate Cover' : 'Generate Cover'}
                            </Button>
                             {bookCoverUrl && (
                                <Button asChild variant="secondary" className="w-full">
                                    <a href={bookCoverUrl} download={`book_cover_${toc.title}.png`}>
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </a>
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Button onClick={startOrResumeWriting}>
                    {hasStartedWriting ? "Resume Writing" : "Start Writing"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {hasStartedWriting && (
                    <Button variant="outline" onClick={handleDownloadStory}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Story (.txt)
                    </Button>
                )}
            </CardFooter>
        </Card>
      )}
      
      {stage === 'WRITING' && toc && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card className="sticky top-20">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>{toc.title}</CardTitle>
                             <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setStage('OUTLINE')}>
                                    <List className="mr-2 h-4 w-4" />
                                    Outline
                                </Button>
                                {allChaptersWritten && (
                                    <Button variant="outline" size="sm" onClick={() => setStage('PREVIEW')}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Preview
                                    </Button>
                                )}
                            </div>
                        </div>
                        <CardDescription>Table of Contents</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ScrollArea className="h-96">
                        <div className="space-y-1 pr-4">
                            {toc.chapters.map((chapter, index) => (
                                <button
                                    key={index}
                                    onClick={() => loadChapter(index)}
                                    disabled={isChapterLoading}
                                    className={`flex w-full items-center justify-between rounded-md p-2 text-left text-sm hover:bg-accent disabled:opacity-50 ${currentChapter === index ? 'bg-accent font-semibold' : ''}`}
                                >
                                    <span>{index + 1}. {chapter.title}</span>
                                    {currentChapter === index && (isChapterLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <PenSquare className="h-4 w-4 text-primary" />)}
                                </button>
                            ))}
                        </div>
                       </ScrollArea>
                    </CardContent>
                    {allChaptersWritten && (
                        <CardFooter>
                            <Button className="w-full" onClick={() => setStage('PREVIEW')}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview Full Story
                            </Button>
                        </CardFooter>
                     )}
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Chapter {currentChapter + 1}: {toc.chapters[currentChapter].title}</CardTitle>
                        <CardDescription>{toc.chapters[currentChapter].description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[70vh] rounded-md border bg-muted p-4">
                            {isChapterLoading ? (
                                <div className="flex h-full items-center justify-center space-x-2">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Writing...</span>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap font-serif text-base leading-relaxed">{chapterContents[currentChapter]}</p>
                            )}
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button onClick={() => loadChapter(currentChapter - 1)} disabled={isChapterLoading || currentChapter === 0}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Chapter
                        </Button>
                        {currentChapter < toc.chapters.length - 1 ? (
                            <Button onClick={() => loadChapter(currentChapter + 1)} disabled={isChapterLoading}>
                                Next Chapter <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                             <Button onClick={() => setStage('PREVIEW')} disabled={isChapterLoading}>
                                Preview Story <Eye className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
      )}

      {stage === 'PREVIEW' && toc && (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{toc.title}</CardTitle>
                        <CardDescription>Full Story Preview</CardDescription>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="outline" onClick={() => setStage('WRITING')}>
                           <PenSquare className="mr-2 h-4 w-4" /> Back to Writing
                        </Button>
                        <Button onClick={handleDownloadStory}>
                            <Download className="mr-2 h-4 w-4" /> Download (.txt)
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className='mb-4'>
                    <Button onClick={handleReadAloud} disabled={isAudioLoading}>
                        {isAudioLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Volume2 className="mr-2 h-4 w-4" />
                        )}
                        Read Aloud
                    </Button>
                    {audioUrl && (
                        <audio
                            src={audioUrl}
                            controls
                            className="mt-4 w-full"
                        />
                    )}
                </div>
                <ScrollArea className="h-[65vh] w-full rounded-md border bg-muted p-4 lg:p-6">
                    <div className="prose prose-lg mx-auto dark:prose-invert">
                        {bookCoverUrl && (
                            <div className="relative mx-auto mb-8 aspect-[2/3] w-full max-w-sm overflow-hidden rounded-lg shadow-lg">
                                <NextImage
                                    src={bookCoverUrl}
                                    alt={`Book cover for ${toc.title}`}
                                    layout="fill"
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <h1 className="font-bold text-3xl">{toc.title}</h1>
                        <p className="italic text-muted-foreground">{toc.plotSummary}</p>
                        <hr />
                        {toc.chapters.map((chapter, index) => (
                            <section key={index}>
                                <h2 className="font-bold text-2xl mt-8">Chapter {index + 1}: {chapter.title}</h2>
                                <p className="whitespace-pre-wrap font-serif text-base leading-relaxed">{chapterContents[index] || '(Content not generated)'}</p>
                            </section>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}

    </div>
  );
}

    

    
