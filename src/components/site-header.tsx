
'use client';

import { useSidebar, SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader() {
  const { isMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      {isMobile && <SidebarTrigger />}
    </header>
  );
}
