'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { CharacterData } from '@/app/types';
import { StrokeAnimation } from './StrokeAnimation';
import { useApp } from '@/app/components/providers/AppProvider';

interface CharacterCardProps {
  character: CharacterData;
  onClose: () => void;
  onRetry?: () => void;
}

const ConfidenceBadge = memo(function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getTone = () => {
    if (confidence >= 0.85) return 'text-jade';
    if (confidence >= 0.65) return 'text-gold';
    if (confidence >= 0.45) return 'text-amber-500';
    return 'text-destructive';
  };

  const getLabel = () => {
    if (confidence >= 0.85) return 'High';
    if (confidence >= 0.65) return 'Good';
    if (confidence >= 0.45) return 'Low';
    return 'Verify';
  };

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${getTone()}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      <span>{getLabel()}</span>
    </div>
  );
});

export const CharacterCard = memo(function CharacterCard({
  character,
  onClose,
  onRetry,
}: CharacterCardProps) {
  const { addToSentence } = useApp();

  const handleAddToSentence = () => {
    addToSentence(character);
    onClose();
  };

  const handleScanAgain = () => {
    onRetry?.();
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 flex max-h-[min(52vh,calc(100vh-11rem))] justify-center overflow-y-auto px-4 pb-2"
      style={{
        bottom: 'calc(7.5rem + env(safe-area-inset-bottom, 0px))',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="character-card-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="pointer-events-auto w-full max-w-sm"
      >
        <Card className="relative gap-0 border-border/80 bg-card/95 py-0 shadow-lg backdrop-blur-md supports-backdrop-filter:bg-card/85">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="absolute right-2 top-2 z-10 text-muted-foreground hover:text-foreground"
            aria-label="Close character details"
          >
            <X className="size-4" />
          </Button>
          <CardContent className="flex flex-col items-center gap-3 px-4 pb-2 pt-10">
            <span
              id="character-card-title"
              className="font-character text-5xl leading-none text-foreground"
            >
              {character.character}
            </span>

            {character.confidence !== undefined && (
              <ConfidenceBadge confidence={character.confidence} />
            )}

            <span className="font-mono text-base text-muted-foreground">
              {character.pinyin}
            </span>

            <p className="text-center text-sm leading-snug text-muted-foreground">
              {character.definition}
            </p>

            <div className="py-1">
              <StrokeAnimation character={character.character} size={112} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t border-border/60 bg-muted/30 px-4 py-3 sm:flex-row sm:justify-end">
            {onRetry && (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleScanAgain}
              >
                Scan again
              </Button>
            )}
            <Button type="button" className="w-full sm:w-auto" onClick={handleAddToSentence}>
              Add to sentence
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
});
