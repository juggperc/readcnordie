'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, BookOpen } from 'lucide-react';
import { useApp } from '@/app/components/providers/AppProvider';
import { MiniCharacterCard } from '@/app/components/character/MiniCharacterCard';
import { Button } from '@/components/ui/button';

export const SentenceBuilder = memo(function SentenceBuilder() {
  const { sentence, removeFromSentence, clearSentence } = useApp();
  const isEmpty = sentence.length === 0;

  const handleClear = useCallback(() => {
    clearSentence();
  }, [clearSentence]);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pt-safe-top">
      <div className="bg-gradient-to-b from-black/90 to-black/60 backdrop-blur-md border-b border-[#262626]/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {isEmpty ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-[#525252]"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">Scan characters to build a sentence</span>
                </motion.div>
              ) : (
                <motion.div className="flex items-center gap-2">
                  {sentence.map((item) => (
                    <MiniCharacterCard
                      key={item.id}
                      item={item}
                      onRemove={() => removeFromSentence(item.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isEmpty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="w-9 h-9 rounded-full text-[#a3a3a3] hover:text-[#e63946] hover:bg-[#e63946]/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});
