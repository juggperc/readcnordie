'use client';

import { motion } from 'framer-motion';
import type { SentenceItem } from '@/app/types';

interface MiniCharacterCardProps {
  item: SentenceItem;
  onRemove: () => void;
}

export function MiniCharacterCard({ item, onRemove }: MiniCharacterCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-[#1f1f1f] border border-[#262626] rounded-xl cursor-pointer hover:border-[#2a9d8f]/50 hover:shadow-[0_0_12px_rgba(42,157,143,0.15)] transition-all"
      onClick={onRemove}
    >
      <span className="text-2xl font-character text-[#f5f5f5]">{item.character}</span>
    </motion.div>
  );
}
