'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { SentenceItem } from '@/app/types';

interface MiniCharacterCardProps {
  item: SentenceItem;
  onRemove: () => void;
}

export const MiniCharacterCard = memo(function MiniCharacterCard({ item, onRemove }: MiniCharacterCardProps) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex w-[4.5rem] shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border border-border bg-card px-2 py-1.5 text-left transition-colors hover:border-ring/40 hover:bg-muted/50"
      onClick={onRemove}
      aria-label={`Remove ${item.character} from sentence`}
    >
      <span className="font-character text-2xl leading-tight text-foreground">{item.character}</span>
      <span className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{item.pinyin}</span>
      <span className="max-w-full truncate text-[9px] leading-tight text-muted-foreground/80">
        {item.definition}
      </span>
    </motion.button>
  );
});
