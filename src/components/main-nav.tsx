
'use client';

import {
  BookText,
  Image,
  LayoutGrid,
  Mail,
  MessageCircle,
  Settings,
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
  { href: '/chatbot', label: 'Chatbot', icon: <MessageCircle /> },
  { href: '/summarizer', label: 'Summarizer', icon: <BookText /> },
  { href: '/composer', label: 'Composer', icon: <Mail /> },
  { href: '/image-generator', label: 'Image Generator', icon: <Image /> },
  { href: '/settings', label: 'Settings', icon: <Settings /> },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarContent>
      <SidebarMenu>
        {menuItems.map((item) => (
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
