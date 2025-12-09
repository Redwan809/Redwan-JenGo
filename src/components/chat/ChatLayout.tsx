
"use client";

import React, { useState, useEffect } from 'react';
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

const initialMessages: Message[] = [
  { 
    id: 'initial-welcome', 
    text: 'Hello! I am Redwan-Intel. How can I help you today?', 
    sender: 'ai' 
  }
];

export default function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages(initialMessages);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat-messages', JSON.stringify(messages));
    }
  }, [messages]);


  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Pass only the recent message history to the AI for context and performance.
      const aiResponse = await getAiResponse(text, newMessages.slice(-5));

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: aiResponse,
        sender: 'ai',
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-full w-full bg-background text-foreground">
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
