'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { CharacterData, SentenceItem } from '@/app/types';

interface AppContextType {
  sentence: SentenceItem[];
  addToSentence: (char: CharacterData) => void;
  removeFromSentence: (id: string) => void;
  clearSentence: () => void;
  isScanning: boolean;
  setIsScanning: (value: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  lastScanned: CharacterData | null;
  setLastScanned: (char: CharacterData | null) => void;
  activeCard: CharacterData | null;
  setActiveCard: (char: CharacterData | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sentence, setSentence] = useState<SentenceItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState<CharacterData | null>(null);
  const [activeCard, setActiveCard] = useState<CharacterData | null>(null);

  const addToSentence = useCallback((char: CharacterData) => {
    const newItem: SentenceItem = {
      id: crypto.randomUUID(),
      character: char.character,
      pinyin: char.pinyin,
      definition: char.definition,
    };
    setSentence((prev) => [...prev, newItem]);
  }, []);

  const removeFromSentence = useCallback((id: string) => {
    setSentence((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearSentence = useCallback(() => {
    setSentence([]);
  }, []);

  const value = useMemo(() => ({
    sentence,
    addToSentence,
    removeFromSentence,
    clearSentence,
    isScanning,
    setIsScanning,
    isProcessing,
    setIsProcessing,
    lastScanned,
    setLastScanned,
    activeCard,
    setActiveCard,
  }), [sentence, addToSentence, removeFromSentence, clearSentence, isScanning, isProcessing, lastScanned, activeCard]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
