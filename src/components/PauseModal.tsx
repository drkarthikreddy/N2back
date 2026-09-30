import React from 'react';
import { Play, RotateCcw, HelpCircle, Pause } from 'lucide-react';

interface PauseModalProps {
  currentTrial: number;
  totalTrials: number;
  nLevel: number;
  onContinue: () => void;
  onNewGame: () => void;
  onHelp: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  currentTrial,
  totalTrials,
  nLevel,
  onContinue,
  onNewGame,
  onHelp,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white border-2 border-black rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-6 flex flex-col items-center gap-5 text-black">
        
        {/* Pause Icon & Title */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 border-2 border-black flex items-center justify-center text-orange-600 shadow-[0_3px_0_#000000]">
            <Pause className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-xl font-black mt-1">Game Paused</h2>
          <span className="font-mono text-xs font-bold text-zinc-600">
            Level N={nLevel} · Trial {currentTrial} of {totalTrials}
          </span>
        </div>

        {/* 3 Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Continue Button */}
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 border-2 border-black text-white font-black text-sm tracking-wide shadow-[0_4px_0_#000000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Continue</span>
          </button>

          {/* New Game Button (Return to Opening Screen) */}
          <button
            type="button"
            onClick={onNewGame}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-50 border-2 border-black text-black font-black text-xs tracking-wide shadow-[0_3px_0_#000000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Game</span>
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={onHelp}
            className="w-full py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-900 font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-orange-600" />
            <span>Help & Rules</span>
          </button>
        </div>

      </div>
    </div>
  );
};
