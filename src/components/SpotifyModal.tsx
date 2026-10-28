import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpotifyHub } from './SpotifyHub';
import { Language } from '../types';

interface SpotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const SpotifyModal: React.FC<SpotifyModalProps> = ({
  isOpen,
  onClose,
  lang = 'es' as Language,
}: SpotifyModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="spotify-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            id="spotify-modal-container"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl max-h-[90vh] bg-[#0E1015] border border-white/10 rounded-2xl overflow-y-auto p-5 sm:p-7 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SpotifyHub lang={lang} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
