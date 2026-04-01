'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CharacterData } from '@/app/types';
import { StrokeAnimation } from './StrokeAnimation';
import { useApp } from '@/app/components/providers/AppProvider';

interface CharacterCardProps {
  character: CharacterData;
  onClose: () => void;
  onRetry?: () => void;
}

const ConfidenceBadge = memo(function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 0.85) return 'text-[#2a9d8f]';
    if (confidence >= 0.65) return 'text-[#d4a574]';
    if (confidence >= 0.45) return 'text-orange-500';
    return 'text-[#e63946]';
  };

  const getLabel = () => {
    if (confidence >= 0.85) return 'High confidence';
    if (confidence >= 0.65) return 'Good';
    if (confidence >= 0.45) return 'Low - tap retry';
    return 'Very low - verify';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 text-xs font-medium ${getColor()}`}
    >
      <span className="w-2 h-2 rounded-full bg-current" />
      <span>{getLabel()}</span>
      <span className="text-xs opacity-60">({Math.round(confidence * 100)}%)</span>
    </motion.div>
  );
});

export const CharacterCard = memo(function CharacterCard({ character, onClose, onRetry }: CharacterCardProps) {
  const { addToSentence } = useApp();

  const handleAddToSentence = () => {
    addToSentence(character);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center pt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="text-6xl font-character text-[#f5f5f5] mb-2"
          >
            {character.character}
          </motion.div>

          {character.confidence !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-3"
            >
              <ConfidenceBadge confidence={character.confidence} />
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-lg text-[#d4a574] mb-4"
          >
            {character.pinyin}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-[#a3a3a3] text-center mb-6"
          >
            {character.definition}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <StrokeAnimation character={character.character} size={150} />
          </motion.div>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-[#262626] text-[#a3a3a3] hover:bg-[#262626] hover:text-[#f5f5f5]"
            >
              Discard
            </Button>
            {character.confidence !== undefined && character.confidence < 0.65 && onRetry && (
              <Button
                variant="ghost"
                onClick={onRetry}
                className="flex-1 bg-orange-500/20 border border-orange-500/50 text-orange-400 hover:bg-orange-500/30"
              >
                Retry Scan
              </Button>
            )}
            <Button
              onClick={handleAddToSentence}
              className="flex-1 bg-[#2a9d8f] hover:bg-[#238b7f] text-white"
            >
              Add to Sentence
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
