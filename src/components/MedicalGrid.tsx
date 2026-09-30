import React from 'react';
import { Volume2, Sparkles, Activity } from 'lucide-react';
import { MedicalWord } from '../types/game';
import { MEDICAL_DICTIONARY } from '../data/medicalTerms';

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
  currentSound,
  isPlayingAudio,
  immediateVisualResult,
  immediateAudioResult,
}) => {
  return (
    <div className="relative w-full max-w-[360px] aspect-square mx-auto flex flex-col items-center justify-center">
      {/* Outer Clinical Border Glow */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500/10 via-teal-500/5 to-blue-500/10 rounded-2xl blur-xl pointer-events-none" />

      {/* Main 3x3 Grid Matrix */}
      <div className="relative w-full h-full p-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl grid grid-cols-3 grid-rows-3 gap-3">
        {Array.from({ length: 9 }).map((_, idx) => {
          const isActive = isStimulusActive && activePosition === idx;

          return (
            <div
              key={idx}
              className={`relative rounded-xl border flex items-center justify-center transition-all duration-150 select-none overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-br from-teal-400 to-cyan-500 border-cyan-200 text-slate-950 shadow-[0_0_24px_rgba(20,184,166,0.6)] scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/60'
              }`}
            >
              {/* Subtle grid position indicator in corner */}
              <span className={`absolute top-1.5 left-2 text-[10px] font-mono tracking-tighter ${
                isActive ? 'text-teal-950/70 font-semibold' : 'text-slate-600'
              }`}>
                {idx + 1}
              </span>

              {/* Active Positive Stimulus Mark */}
              {isActive ? (
                <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-75 duration-150">
                  <div className="relative">
                    {/* Glowing pulse ring */}
                    <div className="absolute -inset-1.5 bg-white/40 rounded-full animate-ping" />
                    {/* Medical Cross / Target Center */}
                    <div className="relative w-9 h-9 rounded-lg bg-slate-950/90 text-teal-400 flex items-center justify-center shadow-lg border border-teal-300/40">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                /* Inactive cell crosshair marker */
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Audio Telemetry Wave Indicator below grid */}
      <div className="absolute -bottom-10 left-0 right-0 flex items-center justify-between px-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Activity className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-teal-400 animate-pulse' : 'text-slate-600'}`} />
          <span className="font-mono text-[11px]">
            {isPlayingAudio ? (
              <span className="text-teal-400 font-medium tracking-wide">
                AUDIO STIMULUS: <span className="font-bold uppercase tracking-wider">{currentSound ? MEDICAL_DICTIONARY[currentSound]?.display : 'PLAYING'}</span>
              </span>
            ) : (
              <span className="text-slate-500">Audio ready</span>
            )}
          </span>
        </div>

        {/* Audio soundwaves animation */}
        <div className="flex items-end gap-0.5 h-3">
          {[1, 2, 3, 4, 5].map((bar) => (
            <div
              key={bar}
              className={`w-0.5 rounded-full transition-all duration-150 ${
                isPlayingAudio ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
              style={{
                height: isPlayingAudio ? `${Math.sin(bar * 1.5 + Date.now() / 200) * 8 + 10}px` : '3px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
