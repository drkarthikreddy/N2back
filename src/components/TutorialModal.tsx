import React, { useState } from 'react';
import { X, Volume2, Brain } from 'lucide-react';
import { MEDICAL_WORDS, MEDICAL_DICTIONARY } from '../data/medicalTerms';
import { playMedicalSpeech } from '../utils/audio';
import { MedicalWord } from '../types/game';

interface TutorialModalProps {
  onClose: () => void;
  audioVolume: number;
  voiceURI?: string | null;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  onClose,
  audioVolume,
  voiceURI,
}) => {
  const [playingWord, setPlayingWord] = useState<MedicalWord | null>(null);

  const testWord = (word: MedicalWord) => {
    setPlayingWord(word);
    playMedicalSpeech(word, audioVolume, voiceURI).finally(() => {
      setPlayingWord(null);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white border-2 border-black rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-5 flex flex-col gap-4 text-black">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black">How to Play</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Rules - Clean & Uncluttered */}
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-2 text-xs leading-relaxed text-zinc-800">
          <p>
            Track two streams simultaneously on each turn:
          </p>
          <div className="flex items-center gap-2 font-bold text-black pt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span>Position in the 3×3 Grid</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-black">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span>Spoken Medical Word</span>
          </div>
          <p className="pt-1">
            If the current position or sound matches what was presented <strong>exactly N steps ago</strong>, tap the button:
          </p>
        </div>

        {/* Buttons summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl border-2 border-black bg-white flex flex-col items-center text-center">
            <span className="text-xs font-black text-black">POSITION [A]</span>
            <span className="text-[11px] text-zinc-600 mt-1">Tap when position matches turn N steps ago</span>
          </div>
          <div className="p-3 rounded-xl border-2 border-black bg-white flex flex-col items-center text-center">
            <span className="text-xs font-black text-black">SOUND [L]</span>
            <span className="text-[11px] text-zinc-600 mt-1">Tap when medical word matches turn N steps ago</span>
          </div>
        </div>

        {/* 9 Words Soundboard */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-black">9 Medical Sound Stimuli (Tap to hear):</span>
          <div className="grid grid-cols-3 gap-1.5">
            {MEDICAL_WORDS.map((w) => {
              const isPlaying = playingWord === w;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => testWord(w)}
                  className={`py-2 px-2 rounded-xl border text-center font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isPlaying
                      ? 'bg-orange-500 text-white border-black shadow-sm'
                      : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-black'
                  }`}
                >
                  <Volume2 className="w-3 h-3 text-orange-600" />
                  <span>{MEDICAL_DICTIONARY[w].display}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_3px_0_#9a3412] active:translate-y-0.5 active:shadow-none transition-all mt-1 cursor-pointer"
        >
          Got It, Play Game
        </button>

      </div>
    </div>
  );
};
