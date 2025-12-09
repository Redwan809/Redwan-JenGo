"use client";

import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

type ChatSidebarProps = {
  onClearChat: () => void;
};


export default function ChatSidebar({ onClearChat }: ChatSidebarProps) {
  
  return (
    <div className="flex h-full flex-col">
      <SidebarHeader>
        <Button 
          variant="outline" 
          className="h-10 w-full justify-start rounded-full border-accent bg-transparent px-4 text-sm font-normal text-foreground/90 hover:bg-accent"
          onClick={onClearChat}
        >
          <Plus className="mr-2 size-4" />
          New chat
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <span className="px-2 text-xs text-muted-foreground">Recent</span>
            {/* Future implementation: Map through recent chat history here */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </div>
  );
}
