
'use client';

import {
  generateNonFictionOutline,
  writeNonFictionSection,
  generateNonFictionCover,
  type NonFictionOutlineOutput,
  type NonFictionGenre,
} from '@/ai/flows/non-fiction-writer';
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
  BookImage,
  BookOpen,
  Brain,
  Download,
  ImageIcon,
  Loader2,
  PenSquare,
} from 'lucide-react';
import NextImage from 'next/image';
import { useState, type FormEvent } from 'react';

type Stage = 'SETUP' | 'OUTLINE' | 'WRITING';

const genres: NonFictionGenre[] = ['Self-help', 'Personal Development', 'Motivational', 'Business / Success', 'Psychology (Applied / Popular)', 'General Non-fiction'];

export function NonFictionWriterView() {
  // Setup State
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState<NonFictionGenre>('General Non-fiction');
  const [numSections, setNumSections] = useState(7);
  const [targetAudience, setTargetAudience] = useState('');
  
  // Data State
  const [stage, setStage] = useState<Stage>('SETUP');
  const [outline, setOutline] = useState<NonFictionOutlineOutput | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionContents, setSectionContents] = useState<Record<number, string>>({});
  const [bookCoverUrl, setBookCoverUrl] = useState('');

  // Loading State
  const [isOutlineLoading, setIsOutlineLoading] = useState(false);
  const [isSectionLoading, setIsSectionLoading] = useState(false);
  const [isCoverLoading, setIsCoverLoading] = useState(false);
  
  const { toast } = useToast();

  const handleOutlineSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsOutlineLoading(true);
    setOutline(null);
    setStage('SETUP');

    try {
      const result = await generateNonFictionOutline({ topic, genre, numSections, targetAudience });
      setOutline(result);
      setStage('OUTLINE');
    } catch (error) {
      console.error('Error generating outline:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the outline. Please try again.',
      });
    } finally {
      setIsOutlineLoading(false);
    }
  };

  const startWriting = async () => {
    setStage('WRITING');
    loadSection(0);
  };

  const loadSection = async (sectionIndex: number) => {
    if (!outline) return;

    if(sectionContents[sectionIndex]) {
        setCurrentSection(sectionIndex);
        return;
    }
    
    setIsSectionLoading(true);
    setCurrentSection(sectionIndex);

    try {
        const result = await writeNonFictionSection({ topic, genre, fullOutline: outline, sectionIndex });
        setSectionContents((prev) => ({...prev, [sectionIndex]: result.sectionContent}));
    } catch (error) {
        console.error('Error writing section:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Failed to write Section ${sectionIndex + 1}. Please try again.`,
        });
    } finally {
        setIsSectionLoading(false);
    }
  };

  const handleGenerateCover = async () => {
    if(!outline) return;
    setIsCoverLoading(true);
    setBookCoverUrl('');
    try {
      const result = await generateNonFictionCover({ title: outline.title, genre: genre });
      setBookCoverUrl(result.image);
    } catch (error: any) {
       console.error('Error generating book cover:', error);
        let description = 'Failed to generate book cover. Please try again.';
        if (error.message && error.message.includes('500')) {
            description = 'The image generation service is currently unavailable. Please try again in a few moments.';
        }
        toast({
            variant: 'destructive',
            title: 'Error',
            description,
        });
    } finally {
        setIsCoverLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Non-Fiction Writer
        </h1>
        <p className="text-muted-foreground">
          Generate structured, informative content on any topic.
        </p>
      </header>

      {stage === 'SETUP' && (
        <Card>
          <CardHeader>
            <CardTitle>1. Content Setup</CardTitle>
            <CardDescription>
              Provide the core topic and desired structure for your content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOutlineSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Main Topic / Thesis</Label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The principles of effective time management for entrepreneurs."
                  className="h-24 resize-none"
                  disabled={isOutlineLoading}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                    <Label htmlFor="genre-select">Genre</Label>
                    <Select
                        value={genre}
                        onValueChange={(v) => setGenre(v as NonFictionGenre)}
                        disabled={isOutlineLoading}
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
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Input
                        id="target-audience"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g., Young professionals, students, etc."
                        disabled={isOutlineLoading}
                    />
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="num-sections">
                    Number of Sections: {numSections}
                  </Label>
                  <Slider
                    id="num-sections"
                    min={2} max={20} step={1}
                    value={[numSections]}
                    onValueChange={(v) => setNumSections(v[0])}
                    disabled={isOutlineLoading}
                  />
                </div>
              <Button type="submit" disabled={isOutlineLoading || !topic.trim()}>
                {isOutlineLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Outline
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {stage === 'OUTLINE' && outline && (
         <Card>
            <CardHeader>
                <CardTitle>2. Content Outline & Cover</CardTitle>
                <CardDescription>
                    Review the generated outline and create a cover for your work.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <div>
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <h3 className="font-bold text-lg">{outline.title}</h3>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Introduction</Label>
                        <p className="text-sm text-muted-foreground italic pt-2">{outline.introduction}</p>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Sections</Label>
                        <div className="space-y-2 pt-2">
                            {outline.sections.map((section, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <span className="font-bold">{index + 1}.</span>
                                    <div>
                                        <p className="font-semibold">{section.title}</p>
                                        <p className="text-muted-foreground">{section.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <Label className="text-xs text-muted-foreground">Conclusion</Label>
                        <p className="text-sm text-muted-foreground italic pt-2">{outline.conclusion}</p>
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
                                    <a href={bookCoverUrl} download={`book_cover_${outline.title}.png`}>
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </a>
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={startWriting}>
                    Start Writing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
      )}
      
      {stage === 'WRITING' && outline && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card className="sticky top-20">
                    <CardHeader>
                        <CardTitle>{outline.title}</CardTitle>
                        <CardDescription>Content Sections</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ScrollArea className="h-96">
                        <div className="space-y-1 pr-4">
                            {outline.sections.map((section, index) => (
                                <button
                                    key={index}
                                    onClick={() => loadSection(index)}
                                    disabled={isSectionLoading}
                                    className={`flex w-full items-center justify-between rounded-md p-2 text-left text-sm hover:bg-accent disabled:opacity-50 ${currentSection === index ? 'bg-accent font-semibold' : ''}`}
                                >
                                    <span>{index + 1}. {section.title}</span>
                                    {currentSection === index && (isSectionLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <PenSquare className="h-4 w-4 text-primary" />)}
                                </button>
                            ))}
                        </div>
                       </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Section {currentSection + 1}: {outline.sections[currentSection].title}</CardTitle>
                        <CardDescription>{outline.sections[currentSection].description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[70vh] rounded-md border bg-muted p-4">
                            {isSectionLoading ? (
                                <div className="flex h-full items-center justify-center space-x-2">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Writing...</span>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap text-base leading-relaxed">{sectionContents[currentSection]}</p>
                            )}
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Button onClick={() => loadSection(currentSection - 1)} disabled={isSectionLoading || currentSection === 0}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Section
                        </Button>
                        <Button onClick={() => loadSection(currentSection + 1)} disabled={isSectionLoading || currentSection === outline.sections.length - 1}>
                           Next Section <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      )}

    </div>
  );
}
