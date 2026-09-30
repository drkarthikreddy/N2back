import React from 'react';
import { Eye, Headphones, Play, Pause, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  onVisualPress: () => void;
  onAudioPress: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  visualPressedThisTrial: boolean;
  audioPressedThisTrial: boolean;
  trialProgressPercent: number; // 0 to 100 for current trial time countdown
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
  onTogglePause,
  onRestart,
  visualPressedThisTrial,
  audioPressedThisTrial,
  trialProgressPercent,
  immediateVisualResult,
  immediateAudioResult,
  showImmediateFeedback,
  disabled,
}) => {
  return (
    <div className="w-full max-w-[420px] mx-auto mt-12 flex flex-col gap-4">
      {/* Trial Countdown Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full transition-all duration-75 ease-linear"
          style={{ width: `${Math.min(100, Math.max(0, trialProgressPercent))}%` }}
        />
      </div>

      {/* Main Dual N-Back Response Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {/* Visual / Position Match Button */}
        <button
          type="button"
          onClick={onVisualPress}
          disabled={disabled || !isPlaying || isPaused}
          className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border text-left transition-all select-none active:scale-[0.98] ${
            visualPressedThisTrial
              ? 'bg-cyan-950/80 border-cyan-400/80 text-cyan-200 ring-2 ring-cyan-500/40'
              : 'bg-slate-900 hover:bg-slate-800/90 border-slate-700/80 text-slate-100 hover:border-slate-600'
          } ${
            showImmediateFeedback && immediateVisualResult === 'hit'
              ? 'ring-2 ring-emerald-500 bg-emerald-950/40 border-emerald-400'
              : ''
          } ${
            showImmediateFeedback && immediateVisualResult === 'false_alarm'
              ? 'ring-2 ring-rose-500 bg-rose-950/40 border-rose-400'
              : ''
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-cyan-400">
              <Eye className="w-4 h-4" />
              <span>POSITION</span>
            </div>
            <kbd className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-800 border border-slate-600 text-slate-300 rounded shadow-inner">
              A
            </kbd>
          </div>

          <div className="w-full text-sm font-semibold tracking-tight text-white flex items-center justify-between">
            <span>Visual Match</span>
            {visualPressedThisTrial && (
              <span className="text-[10px] font-mono text-cyan-400 font-normal">
                REGISTERED
              </span>
            )}
          </div>

          <div className="w-full text-[11px] text-slate-400 mt-1">
            Match N steps back
          </div>
        </button>

        {/* Audio / Sound Match Button */}
        <button
          type="button"
          onClick={onAudioPress}
          disabled={disabled || !isPlaying || isPaused}
          className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border text-left transition-all select-none active:scale-[0.98] ${
            audioPressedThisTrial
              ? 'bg-indigo-950/80 border-indigo-400/80 text-indigo-200 ring-2 ring-indigo-500/40'
              : 'bg-slate-900 hover:bg-slate-800/90 border-slate-700/80 text-slate-100 hover:border-slate-600'
          } ${
            showImmediateFeedback && immediateAudioResult === 'hit'
              ? 'ring-2 ring-emerald-500 bg-emerald-950/40 border-emerald-400'
              : ''
          } ${
            showImmediateFeedback && immediateAudioResult === 'false_alarm'
              ? 'ring-2 ring-rose-500 bg-rose-950/40 border-rose-400'
              : ''
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-indigo-400">
              <Headphones className="w-4 h-4" />
              <span>SOUND</span>
            </div>
            <kbd className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-800 border border-slate-600 text-slate-300 rounded shadow-inner">
              L
            </kbd>
          </div>

          <div className="w-full text-sm font-semibold tracking-tight text-white flex items-center justify-between">
            <span>Audio Match</span>
            {audioPressedThisTrial && (
              <span className="text-[10px] font-mono text-indigo-400 font-normal">
                REGISTERED
              </span>
            )}
          </div>

          <div className="w-full text-[11px] text-slate-400 mt-1">
            Match N steps back
          </div>
        </button>
      </div>

      {/* Auxiliary Controls (Pause, Restart, Keyboard reminder) */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <span>Shortcuts:</span>
          <span className="text-slate-400 font-mono">[A]</span>
          <span>Position</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-400 font-mono">[L]</span>
          <span>Sound</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-400 font-mono">[Space]</span>
          <span>Pause</span>
        </div>

        <div className="flex items-center gap-2">
          {isPlaying && (
            <button
              type="button"
              onClick={onTogglePause}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={onRestart}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Restart round"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
