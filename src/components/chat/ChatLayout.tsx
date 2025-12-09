"use client";

import React, { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatDisplay from './ChatDisplay';
import ChatInput from './ChatInput';
import { getAiResponse } from '@/app/actions';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

export default function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'initial-welcome', 
      text: 'Hello! I am Redwan-Intel. How can I help you today?', 
      sender: 'ai' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await getAiResponse(text);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: aiResponseText,
        sender: 'ai',
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground">
        <Sidebar className="w-[260px]">
          <ChatSidebar />
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <ChatHeader />
          <ChatDisplay messages={messages} isLoading={isLoading} />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
