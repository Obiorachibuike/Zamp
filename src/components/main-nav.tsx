
'use client';

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
  Music,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: <LayoutGrid /> },
  { href: '/summarizer', label: 'Summarizer', icon: <BookText /> },
  { href: '/composer', label: 'Composer', icon: <Mail /> },
  { href: '/image-generator', label: 'Image Generator', icon: <Image /> },
  { href: '/talking-photo', label: 'Talking Photo', icon: <MessageSquareQuote /> },
  { href: '/avatar-generator', label: 'Avatar Generator', icon: <Smile /> },
  { href: '/image-to-cartoon', label: 'Image to Cartoon', icon: <Palette /> },
  { href: '/image-to-animation', label: 'Image to Animation', icon: <Film /> },
  { href: '/lyrics-generator', label: 'Lyrics Generator', icon: <Music /> },
  { href: '/image-captioning', label: 'Image Captioning', icon: <Type /> },
  { href: '/grammar-checker', label: 'Grammar Checker', icon: <FileCheck /> },
  { href: '/code-generator', label: 'Code Generator', icon: <Code2 /> },
  { href: '/video-generator', label: 'Video Generator', icon: <Video /> },
  {
    href: '/youtube-transcriber',
    label: 'YouTube Transcriber',
    icon: <Youtube />,
  },
  {
    href: '/background-remover',
    label: 'Background Remover',
    icon: <Scan />,
  },
  {
    href: '/image-editor',
    label: 'Image Editor',
    icon: <Edit />,
  },
    {
    href: '/image-enhancer',
    label: 'Image Enhancer',
    icon: <Sparkles />,
  },
  {
    href: '/text-to-speech',
    label: 'Text-to-Speech',
    icon: <Mic />,
  },
  {
    href: '/chart-generator',
    label: 'Chart Generator',
    icon: <BarChart />,
  },
  {
    href: '/translator',
    label: 'Translator',
    icon: <Languages />,
  },
  {
    href: '/sentiment-analyzer',
    label: 'Sentiment Analyzer',
    icon: <TrendingUp />,
  },
  {
    href: '/tone-changer',
    label: 'Tone Changer',
    icon: <Wand />,
  },
  {
    href: '/quiz-generator',
    label: 'Quiz Generator',
    icon: <HelpCircle />,
  },
  {
    href: '/email-reply-generator',
    label: 'Email Reply Generator',
    icon: <Reply />,
  },
  {
    href: '/flashcard-generator',
    label: 'Flashcard Generator',
    icon: <Copy />,
  },
  {
    href: '/social-content-generator',
    label: 'Social Content Generator',
    icon: <Share2 />,
  },
  {
    href: '/humanizer',
    label: 'AI Text Humanizer',
    icon: <Feather />,
  },
  {
    href: '/researcher',
    label: 'AI Researcher',
    icon: <Search />,
  },
  {
    href: '/story-writer',
    label: 'Story Writer',
    icon: <BookOpen />,
  },
  {
    href: '/non-fiction-writer',
    label: 'Non-Fiction Writer',
    icon: <Brain />,
  },
  { href: '/settings', label: 'Settings', icon: <Settings /> },
];

export function MainNav() {
  const pathname = usePathname();

  const sortedMenuItems = [...menuItems.slice(1)].sort((a,b) => a.label.localeCompare(b.label));
  sortedMenuItems.unshift(menuItems[0]); // Keep Dashboard at the top
  const settingsIndex = sortedMenuItems.findIndex(item => item.href === '/settings');
  if (settingsIndex > -1) {
    const [settingsItem] = sortedMenuItems.splice(settingsIndex, 1);
    sortedMenuItems.push(settingsItem);
  }


  return (
    <SidebarContent>
      <SidebarMenu>
        {sortedMenuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  );
}
