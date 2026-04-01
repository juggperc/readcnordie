'use client';

import { motion } from 'framer-motion';
import { Camera, Zap, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlBarProps {
  onCapture: () => void;
  isProcessing: boolean;
  disabled: boolean;
}

export function ControlBar({ onCapture, isProcessing, disabled }: ControlBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pb-safe-bottom px-6 py-6 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
      >
        <Zap className="w-5 h-5" />
      </Button>

      <motion.button
        onClick={onCapture}
        disabled={disabled || isProcessing}
        className="relative w-18 h-18 rounded-full flex items-center justify-center disabled:opacity-50"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-[#e63946]" />
        <motion.div
          className="w-14 h-14 rounded-full bg-white"
          animate={{
            scale: isProcessing ? 0.8 : 1,
            backgroundColor: isProcessing ? '#e63946' : '#ffffff',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white/30"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{
              borderTopColor: 'white',
            }}
          />
        )}
      </motion.button>

      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
      >
        <ImageIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}
