
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
  const [isStorageLoading, setIsStorageLoading] = useState(true);

  // Load messages from localStorage on initial render
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chat-messages');
      if (savedMessages && savedMessages.length > 2) { // Check for non-empty array
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages(initialMessages);
      }
    } catch (e) {
        // If parsing fails, start with initial messages
        setMessages(initialMessages);
    } finally {
        setIsStorageLoading(false);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    // Don't save during the initial load, only on subsequent changes
    if (!isStorageLoading) {
      localStorage.setItem('chat-messages', JSON.stringify(messages));
    }
  }, [messages, isStorageLoading]);


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
      const aiResponseText = await getAiResponse(text, newMessages.slice(-5));

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

  const handleClearChat = () => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].id === 'initial-welcome')) {
      return; // Do nothing if there's nothing to save.
    }
    
    // 1. Convert messages to JSON format
    const jsonString = JSON.stringify(messages, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 2. Create a temporary link to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();

    // 3. Clean up the temporary link and URL object
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 4. Clear the chat from localStorage and state
    localStorage.removeItem('chat-messages');
    setMessages(initialMessages);
  };


  if (isStorageLoading) {
    return <div className="flex h-svh w-full items-center justify-center bg-background"></div>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full bg-background text-foreground">
        <Sidebar className="w-[260px]">
          <ChatSidebar onClearChat={handleClearChat} />
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <ChatHeader onClearChat={handleClearChat} />
          <ChatDisplay messages={messages} isLoading={isLoading} />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
