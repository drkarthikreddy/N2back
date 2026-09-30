import React from 'react';
import { MedicalWord } from '../types/game';

interface MedicalGridProps {
  activePosition: number | null;
  isStimulusActive: boolean;
  currentSound: MedicalWord | null;
  isPlayingAudio: boolean;
  immediateVisualResult: 'hit' | 'miss' | 'false_alarm' | null;
  immediateAudioResult: 'hit' | 'miss' | 'false_alarm' | null;
}

export const MedicalGrid: React.FC<MedicalGridProps> = ({
  activePosition,
  isStimulusActive,
}) => {
  return (
    <div className="w-full h-full max-h-full max-w-full aspect-square mx-auto flex items-center justify-center select-none p-0.5">
      {/* 3x3 Positive Grid Matrix - Fills Available Viewport Space */}
      <div className="w-full h-full p-2 sm:p-2.5 bg-white rounded-2xl border-2 border-black shadow-[0_8px_24px_rgba(0,0,0,0.08)] grid grid-cols-3 grid-rows-3 gap-2 sm:gap-2.5">
        {Array.from({ length: 9 }).map((_, idx) => {
          const isActive = isStimulusActive && activePosition === idx;

          return (
            <div
              key={idx}
              className={`relative rounded-xl flex items-center justify-center transition-all duration-100 ${
                isActive
                  ? 'bg-orange-500 border-2 border-black shadow-[0_4px_12px_rgba(249,115,22,0.4)] scale-[1.02]'
                  : 'bg-zinc-50 border border-zinc-200'
              }`}
            >
              {/* Positive Stimulus Indicator */}
              {isActive ? (
                <div className="flex items-center justify-center animate-in zoom-in-90 duration-100">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-black text-white flex items-center justify-center shadow-md">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-white"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-zinc-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
