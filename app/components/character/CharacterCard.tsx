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
    if (confidence >= 0.85) return 'High';
    if (confidence >= 0.65) return 'Good';
    if (confidence >= 0.45) return 'Low';
    return 'Verify';
  };

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${getColor()}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      <span>{getLabel()}</span>
    </div>
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

        <div className="flex flex-col items-center pt-4 gap-3">
          <span className="text-6xl font-character text-[#f5f5f5]">
            {character.character}
          </span>

          {character.confidence !== undefined && (
            <ConfidenceBadge confidence={character.confidence} />
          )}

          <span className="font-mono text-lg text-[#d4a574]">
            {character.pinyin}
          </span>

          <span className="text-sm text-[#a3a3a3] text-center">
            {character.definition}
          </span>

          <div className="mt-2">
            <StrokeAnimation character={character.character} size={120} />
          </div>

          <div className="flex gap-3 w-full mt-4">
            <Button
              onClick={handleAddToSentence}
              className="flex-1 bg-[#2a9d8f] hover:bg-[#238b7f] text-white"
            >
              Add
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});