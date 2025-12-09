"use client";

import { SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';
import { useSidebar } from '../ui/sidebar';
import { Button } from '../ui/button';

export default function ChatSidebar() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="flex h-full flex-col">
      <SidebarHeader>
        <Button 
          variant="outline" 
          className="h-10 w-full justify-start rounded-full border-accent bg-transparent px-4 text-sm font-normal text-foreground/90 hover:bg-accent"
          onClick={() => window.location.reload()} // Simple refresh for "New Chat"
        >
          <Plus className="mr-2 size-4" />
          New chat
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <span className="px-2 text-xs text-muted-foreground">Recent</span>
            {/* Recent chats can be mapped here in the future */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </div>
  );
}
