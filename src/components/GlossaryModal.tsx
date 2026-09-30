import React, { useState } from 'react';
import { X, Volume2, Search, Stethoscope } from 'lucide-react';
import { MEDICAL_WORDS, MEDICAL_DICTIONARY } from '../data/medicalTerms';
import { playMedicalSpeech } from '../utils/audio';
import { MedicalWord } from '../types/game';

interface GlossaryModalProps {
  onClose: () => void;
  audioVolume: number;
  voiceURI?: string | null;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  onClose,
  audioVolume,
  voiceURI,
}) => {
  const [search, setSearch] = useState('');
  const [playingWord, setPlayingWord] = useState<MedicalWord | null>(null);

  const filteredWords = MEDICAL_WORDS.filter((w) => {
    const info = MEDICAL_DICTIONARY[w];
    const q = search.toLowerCase();
    return (
      info.display.toLowerCase().includes(q) ||
      info.fullName.toLowerCase().includes(q)
    );
  });

  const handlePronounce = (word: MedicalWord) => {
    setPlayingWord(word);
    playMedicalSpeech(word, audioVolume, voiceURI).finally(() => {
      setPlayingWord(null);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white border-2 border-black rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-5 flex flex-col gap-4 text-black">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">Medical Audio Glossary</h2>
              <span className="text-[11px] text-zinc-500 font-mono">9 Clinical Conditions</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-2.5">
          {filteredWords.map((w) => {
            const item = MEDICAL_DICTIONARY[w];
            const isSpeaking = playingWord === w;

            return (
              <div
                key={w}
                className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3 hover:border-black transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-black">
                      {item.display}
                    </span>
                    <span className="text-xs font-bold text-orange-600 truncate">
                      {item.fullName}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 line-clamp-1 mt-0.5">
                    {item.overview}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePronounce(w)}
                  className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-orange-500 text-white border-black'
                      : 'bg-white border-zinc-300 hover:border-black text-black'
                  }`}
                  title="Pronounce"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs transition-colors cursor-pointer"
        >
          Close
        </button>

      </div>
    </div>
  );
};
