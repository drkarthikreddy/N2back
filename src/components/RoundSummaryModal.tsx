import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Share2, Check, ArrowRight, BookOpen, Eye, Headphones } from 'lucide-react';
import { SessionStats, Trial } from '../types/game';
import { MEDICAL_DICTIONARY } from '../data/medicalTerms';

interface RoundSummaryModalProps {
  stats: SessionStats;
  trials: Trial[];
  onNextRound: () => void;
  onOpenGlossary: () => void;
  onClose: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  stats,
  trials,
  onNextRound,
  onOpenGlossary,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedTrialIdx, setSelectedTrialIdx] = useState<number | null>(null);

  const handleShare = () => {
    const text = `MedNBack Brain Training\nLevel: N=${stats.nLevel}\nVisual: ${stats.visualAccuracy}%\nAudio: ${stats.audioAccuracy}%\nScore: ${stats.combinedAccuracy}%\nOutcome: ${
      stats.levelChange === 'promoted'
        ? 'Promoted to N=' + stats.nextNLevel
        : stats.levelChange === 'demoted'
        ? 'Adjusted to N=' + stats.nextNLevel
        : 'Maintained N=' + stats.nLevel
    }`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    });
  };

  const selectedTrial = selectedTrialIdx !== null ? trials[selectedTrialIdx] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white border-2 border-black rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-5 flex flex-col gap-4 text-black">
        
        {/* Outcome Header */}
        <div className="text-center flex flex-col items-center">
          <div className="mb-2 p-3 rounded-full bg-orange-100 border-2 border-orange-500 text-orange-600">
            {stats.levelChange === 'promoted' && <TrendingUp className="w-7 h-7 stroke-[3]" />}
            {stats.levelChange === 'demoted' && <TrendingDown className="w-7 h-7 stroke-[3]" />}
            {stats.levelChange === 'maintained' && <Minus className="w-7 h-7 stroke-[3]" />}
          </div>

          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600">
            Level N={stats.nLevel} Complete
          </span>

          <h2 className="text-2xl font-black tracking-tight text-black mt-0.5">
            {stats.levelChange === 'promoted' && `Promoted to N=${stats.nextNLevel}!`}
            {stats.levelChange === 'demoted' && `Adjusting to N=${stats.nextNLevel}`}
            {stats.levelChange === 'maintained' && `Maintained N=${stats.nLevel}`}
          </h2>
        </div>

        {/* Dual Accuracy Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Visual Channel Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border-2 border-zinc-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-orange-600 stroke-[2.5]" />
                <span>POSITION</span>
              </div>
              <span className="font-mono text-base font-black text-black">
                {stats.visualAccuracy}%
              </span>
            </div>

            <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full"
                style={{ width: `${stats.visualAccuracy}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-zinc-600 font-mono pt-1">
              <span>Hits: <strong>{stats.visualHits}</strong></span>
              <span>Miss: <strong>{stats.visualMisses}</strong></span>
              <span>FA: <strong className={stats.visualFalseAlarms > 0 ? 'text-rose-600' : 'text-zinc-800'}>{stats.visualFalseAlarms}</strong></span>
            </div>
          </div>

          {/* Audio Channel Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border-2 border-zinc-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
              <div className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-orange-600 stroke-[2.5]" />
                <span>SOUND</span>
              </div>
              <span className="font-mono text-base font-black text-black">
                {stats.audioAccuracy}%
              </span>
            </div>

            <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full"
                style={{ width: `${stats.audioAccuracy}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-zinc-600 font-mono pt-1">
              <span>Hits: <strong>{stats.audioHits}</strong></span>
              <span>Miss: <strong>{stats.audioMisses}</strong></span>
              <span>FA: <strong className={stats.audioFalseAlarms > 0 ? 'text-rose-600' : 'text-zinc-800'}>{stats.audioFalseAlarms}</strong></span>
            </div>
          </div>
        </div>

        {/* Trial Ribbon Tape */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
            <span>Round Timeline</span>
            <span className="text-[11px] font-normal text-zinc-500">Tap turn to audit</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto p-2 bg-zinc-100 border border-zinc-200 rounded-xl">
            {trials.map((t, idx) => {
              const isBuffer = idx < stats.nLevel;
              const isSelected = selectedTrialIdx === idx;

              let badgeBg = 'bg-white border-zinc-300 text-zinc-700';
              if (!isBuffer) {
                const visOk = t.visualResult === 'hit' || t.visualResult === 'correct_rejection';
                const audOk = t.audioResult === 'hit' || t.audioResult === 'correct_rejection';
                if (visOk && audOk) {
                  badgeBg = 'bg-emerald-50 border-emerald-500 text-emerald-800';
                } else if (!visOk && !audOk) {
                  badgeBg = 'bg-rose-50 border-rose-400 text-rose-800';
                } else {
                  badgeBg = 'bg-orange-50 border-orange-400 text-orange-800';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTrialIdx(idx)}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${badgeBg} ${
                    isSelected ? 'ring-2 ring-black scale-105' : ''
                  }`}
                >
                  <span className="text-[9px] font-mono font-bold leading-none">{idx + 1}</span>
                  <span className="text-[8px] font-bold uppercase leading-none mt-0.5">
                    {MEDICAL_DICTIONARY[t.sound]?.display.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedTrial && (
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs flex flex-col gap-1 font-mono">
              <div className="flex items-center justify-between font-bold">
                <span>Trial #{selectedTrial.index + 1}</span>
                <span>Sound: {MEDICAL_DICTIONARY[selectedTrial.sound]?.display}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-700">
                <span>Position Match: {selectedTrial.isVisualMatch ? 'YES' : selectedTrial.isVisualLure ? 'NO (LURE TRAP)' : 'NO'}</span>
                <span>Sound Match: {selectedTrial.isAudioMatch ? 'YES' : selectedTrial.isAudioLure ? 'NO (LURE TRAP)' : 'NO'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button - Big Orange Button */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={onNextRound}
            className="w-full py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm tracking-wide shadow-[0_4px_0_#9a3412] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next Round (N={stats.nextNLevel})</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-50 border-2 border-black text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenGlossary}
              className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Glossary</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
