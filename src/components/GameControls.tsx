import React from 'react';
import { Eye, Headphones } from 'lucide-react';

interface GameControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onVisualPress: () => void;
  onAudioPress: () => void;
  visualPressedThisTrial: boolean;
  audioPressedThisTrial: boolean;
  trialProgressPercent: number;
  immediateVisualResult: 'hit' | 'miss' | 'false_alarm' | null;
  immediateAudioResult: 'hit' | 'miss' | 'false_alarm' | null;
  showImmediateFeedback: boolean;
  disabled: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPlaying,
  isPaused,
  onVisualPress,
  onAudioPress,
  visualPressedThisTrial,
  audioPressedThisTrial,
  trialProgressPercent,
  immediateVisualResult,
  immediateAudioResult,
  showImmediateFeedback,
  disabled,
}) => {
  return (
    <div className="w-full max-w-[350px] sm:max-w-[380px] mx-auto flex flex-col gap-2 select-none">
      
      {/* Crisp Progress Bar */}
      <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-orange-500 h-full transition-all duration-75 ease-linear rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, trialProgressPercent))}%` }}
        />
      </div>

      {/* Dual Response Buttons - Clean, Large & Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3">
        {/* Visual Match Button */}
        <button
          type="button"
          onClick={onVisualPress}
          disabled={disabled || !isPlaying || isPaused}
          className={`relative h-20 sm:h-22 rounded-2xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 touch-manipulation cursor-pointer ${
            visualPressedThisTrial
              ? 'bg-orange-500 border-black text-white shadow-inner scale-[0.98]'
              : 'bg-white hover:bg-zinc-50 border-black text-black shadow-[0_4px_0_#000000]'
          } ${
            showImmediateFeedback && immediateVisualResult === 'hit'
              ? 'ring-4 ring-emerald-500'
              : ''
          } ${
            showImmediateFeedback && immediateVisualResult === 'false_alarm'
              ? 'ring-4 ring-rose-500'
              : ''
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center gap-1.5 font-black text-sm tracking-wide">
            <Eye className="w-4 h-4 stroke-[2.5]" />
            <span>POSITION</span>
          </div>
          <span className={`text-[11px] font-mono mt-0.5 ${visualPressedThisTrial ? 'text-white font-bold' : 'text-zinc-600'}`}>
            KEY [A]
          </span>
        </button>

        {/* Audio Match Button */}
        <button
          type="button"
          onClick={onAudioPress}
          disabled={disabled || !isPlaying || isPaused}
          className={`relative h-20 sm:h-22 rounded-2xl border-2 flex flex-col items-center justify-center transition-all active:scale-95 touch-manipulation cursor-pointer ${
            audioPressedThisTrial
              ? 'bg-orange-500 border-black text-white shadow-inner scale-[0.98]'
              : 'bg-white hover:bg-zinc-50 border-black text-black shadow-[0_4px_0_#000000]'
          } ${
            showImmediateFeedback && immediateAudioResult === 'hit'
              ? 'ring-4 ring-emerald-500'
              : ''
          } ${
            showImmediateFeedback && immediateAudioResult === 'false_alarm'
              ? 'ring-4 ring-rose-500'
              : ''
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center gap-1.5 font-black text-sm tracking-wide">
            <Headphones className="w-4 h-4 stroke-[2.5]" />
            <span>SOUND</span>
          </div>
          <span className={`text-[11px] font-mono mt-0.5 ${audioPressedThisTrial ? 'text-white font-bold' : 'text-zinc-600'}`}>
            KEY [L]
          </span>
        </button>
      </div>

    </div>
  );
};
