
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookText,
  Image,
  LayoutGrid,
  Mail,
  MessageCircle,
  Settings,
  Smile,
  Type,
  FileCheck,
  Code2,
  Video,
  Scan,
  Mic,
  BarChart,
  Languages,
  Wand,
  HelpCircle,
  TrendingUp,
  Reply,
  Copy,
  Edit,
  Share2,
  Feather,
  Youtube,
  Search,
  BookOpen,
  Brain,
  MessageSquareQuote,
  Palette,
  Film,
} from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    title: 'Chatbot',
    description: 'Engage in conversations with our AI assistant.',
    href: '/chatbot',
    icon: <MessageCircle className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Text Summarizer',
    description: 'Get concise summaries of long texts.',
    href: '/summarizer',
    icon: <BookText className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Email Composer',
    description: 'Draft professional emails from simple prompts.',
    href: '/composer',
    icon: <Mail className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Image Generator',
    description: 'Create stunning visuals from text descriptions.',
    href: '/image-generator',
    icon: <Image className="h-8 w-8 text-primary" />,
  },
    {
    title: 'Talking Photo',
    description: 'Make a character in a photo speak your text.',
    href: '/talking-photo',
    icon: <MessageSquareQuote className="h-8 w-8 text-primary" />,
  },
  {
    title: 'AI Avatar Generator',
    description: 'Generate unique avatars from text prompts.',
    href: '/avatar-generator',
    icon: <Smile className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Image to Cartoon',
    description: 'Transform a photo into a cartoon-style image.',
    href: '/image-to-cartoon',
    icon: <Palette className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Image to Animation',
    description: 'Turn a static image into an animated video.',
    href: '/image-to-animation',
    icon: <Film className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Image Captioning',
    description: 'Generate descriptive captions for your images.',
    href: '/image-captioning',
    icon: <Type className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Grammar & Style Checker',
    description: 'Correct grammar and improve your writing style.',
    href: '/grammar-checker',
    icon: <FileCheck className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Code Generator',
    description: 'Generate code in various languages from a prompt.',
    href: '/code-generator',
    icon: <Code2 className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Video Generator',
    description: 'Create a short video from a text description.',
    href: '/video-generator',
    icon: <Video className="h-8 w-8 text-primary" />,
  },
  {
    title: 'YouTube Transcriber',
    description: 'Get the transcript from any YouTube video.',
    href: '/youtube-transcriber',
    icon: <Youtube className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Background Remover',
    description: 'Remove the background from an image.',
    href: '/background-remover',
    icon: <Scan className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Image Editor',
    description: 'Edit an image using a text prompt.',
    href: '/image-editor',
    icon: <Edit className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Text-to-Speech',
    description: 'Convert text into natural-sounding audio.',
    href: '/text-to-speech',
    icon: <Mic className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Chart Generator',
    description: 'Create charts from data with natural language.',
    href: '/chart-generator',
    icon: <BarChart className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Translator',
    description: 'Translate text between different languages.',
    href: '/translator',
    icon: <Languages className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Sentiment Analyzer',
    description: 'Analyze the sentiment of a piece of text.',
    href: '/sentiment-analyzer',
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Tone Changer',
    description: 'Change the tone of your writing (e.g., formal, casual).',
    href: '/tone-changer',
    icon: <Wand className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Quiz Generator',
    description: 'Create quizzes from any block of text.',
    href: '/quiz-generator',
    icon: <HelpCircle className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Email Reply Generator',
    description: 'Generate smart replies to your emails.',
    href: '/email-reply-generator',
    icon: <Reply className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Flashcard Generator',
    description: 'Create flashcards for studying from text.',
    href: '/flashcard-generator',
    icon: <Copy className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Social Content Generator',
    description: 'Draft posts for various social media platforms.',
    href: '/social-content-generator',
    icon: <Share2 className="h-8 w-8 text-primary" />,
  },
  {
    title: 'AI Text Humanizer',
    description: 'Rewrite AI-generated text to sound more human.',
    href: '/humanizer',
    icon: <Feather className="h-8 w-8 text-primary" />,
  },
  {
    title: 'AI Researcher',
    description: 'Get a summary and links about a topic.',
    href: '/researcher',
    icon: <Search className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Story Writer',
    description: 'Write a story or novel, chapter by chapter.',
    href: '/story-writer',
    icon: <BookOpen className="h-8 w-8 text-primary" />,
  },
    {
    title: 'Non-Fiction Writer',
    description: 'Generate structured non-fiction content.',
    href: '/non-fiction-writer',
    icon: <Brain className="h-8 w-8 text-primary" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-1.5">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Your one-stop dashboard for powerful AI utilities.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.sort((a,b) => a.title.localeCompare(b.title)).map((tool) => (
          <Link href={tool.href} key={tool.href} className="group">
            <Card className="flex h-full flex-col justify-between transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
              <CardHeader>
                <div className="mb-4">{tool.icon}</div>
                <CardTitle>{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
