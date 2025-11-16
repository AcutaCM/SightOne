"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Assistant type matching the ChatbotChat component structure
 */
export type ChatAssistant = {
  title: string;
  desc: string;
  emoji: string;
  prompt?: string;
};

/**
 * Chat context type
 */
interface ChatContextType {
  assistantList: ChatAssistant[];
  setAssistantList: React.Dispatch<React.SetStateAction<ChatAssistant[]>>;
  currentAssistant: ChatAssistant | null;
  setCurrentAssistant: React.Dispatch<React.SetStateAction<ChatAssistant | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Provider component for ChatContext
 * This is used to share state between ChatbotChat and AssistantMessageDock
 */
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const defaultAssistant: ChatAssistant = { 
    title: "Just Chat", 
    desc: "Default List", 
    emoji: "🦄" 
  };
  
  const [assistantList, setAssistantList] = useState<ChatAssistant[]>([defaultAssistant]);
  const [currentAssistant, setCurrentAssistant] = useState<ChatAssistant | null>(defaultAssistant);

  return (
    <ChatContext.Provider
      value={{
        assistantList,
        setAssistantList,
        currentAssistant,
        setCurrentAssistant,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

/**
 * Hook to use ChatContext
 * Use this in components that need access to ChatbotChat's assistant list
 */
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

/**
 * Hook to use ChatContext with optional fallback
 * Returns undefined if used outside of ChatProvider
 */
export const useChatContextOptional = () => {
  return useContext(ChatContext);
};
