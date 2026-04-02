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
  const tone =
    confidence >= 0.85
      ? 'text-jade'
      : confidence >= 0.65
        ? 'text-gold'
        : confidence >= 0.45
          ? 'text-amber-500'
          : 'text-destructive';

  const label =
    confidence >= 0.85
      ? 'High'
      : confidence >= 0.65
        ? 'Good'
        : confidence >= 0.45
          ? 'Low'
          : 'Verify';

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${tone}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      <span>{label}</span>
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
      className="fixed inset-x-0 z-50 flex justify-center px-4"
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
        className="flex w-full max-w-sm flex-col rounded-xl border border-border/80 bg-card/95 shadow-lg backdrop-blur-md"
        style={{ maxHeight: 'min(52vh, calc(100vh - 14rem))' }}
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
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

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-2 pt-8">
            <div className="flex flex-col items-center gap-2">
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

              <StrokeAnimation character={character.character} size={96} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 rounded-b-xl border-t border-border/60 bg-muted/30 px-4 py-3 sm:flex-row sm:justify-end">
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleScanAgain}
              aria-label="Scan another character"
            >
              Scan again
            </Button>
          )}
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={handleAddToSentence}
            aria-label="Add character to sentence"
          >
            Add to sentence
          </Button>
        </div>
      </motion.div>
    </div>
  );
});
