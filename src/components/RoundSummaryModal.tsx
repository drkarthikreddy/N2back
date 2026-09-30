import React, { useState } from 'react';
import { Award, TrendingUp, TrendingDown, Minus, Share2, Check, ArrowRight, BookOpen, Eye, Headphones, RefreshCw } from 'lucide-react';
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
    const text = `🧠 MedNBack Brain Training\n🏆 N-Back Level: N=${stats.nLevel}\n👁️ Visual Accuracy: ${stats.visualAccuracy}%\n👂 Medical Sound Accuracy: ${stats.audioAccuracy}%\n🎯 Combined Working Memory Score: ${stats.combinedAccuracy}%\nOutcome: ${
      stats.levelChange === 'promoted'
        ? 'Level Up! 🚀'
        : stats.levelChange === 'demoted'
        ? 'Stepped Down'
        : 'Level Maintained'
    }\nTrain your medical cognitive focus on MedNBack!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    });
  };

  const selectedTrial = selectedTrialIdx !== null ? trials[selectedTrialIdx] : null;
  const targetTrial = (selectedTrial && selectedTrial.index >= stats.nLevel)
    ? trials[selectedTrial.index - stats.nLevel]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 text-slate-100">
        
        {/* Outcome Header Banner */}
        <div className="text-center flex flex-col items-center">
          <div className="mb-3 inline-flex p-3 rounded-full bg-slate-800 border border-slate-700">
            {stats.levelChange === 'promoted' && (
              <TrendingUp className="w-8 h-8 text-emerald-400 animate-bounce" />
            )}
            {stats.levelChange === 'demoted' && (
              <TrendingDown className="w-8 h-8 text-amber-400" />
            )}
            {stats.levelChange === 'maintained' && (
              <Minus className="w-8 h-8 text-cyan-400" />
            )}
          </div>

          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Session Completed · Level N={stats.nLevel}
          </span>

          <h2 className="text-2xl font-extrabold tracking-tight mt-1">
            {stats.levelChange === 'promoted' && (
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Promoted to N={stats.nextNLevel}!
              </span>
            )}
            {stats.levelChange === 'demoted' && (
              <span className="text-amber-400">
                Adjusting to N={stats.nextNLevel}
              </span>
            )}
            {stats.levelChange === 'maintained' && (
              <span className="text-slate-100">
                Solid Consistency! Maintained N={stats.nLevel}
              </span>
            )}
          </h2>

          <p className="text-xs text-slate-400 mt-1 max-w-md">
            {stats.levelChange === 'promoted'
              ? 'Outstanding performance (>80% accuracy). Your working memory threshold is expanding!'
              : stats.levelChange === 'demoted'
              ? 'Accuracy fell below 50%. Stepping back allows working memory consolidation.'
              : 'Keep practicing to break the 80% threshold across both modalities!'}
          </p>
        </div>

        {/* Dual Accuracy Gauges */}
        <div className="grid grid-cols-2 gap-4">
          {/* Visual Channel Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>VISUAL POSITION</span>
              </div>
              <span className="font-mono text-base font-bold text-white">
                {stats.visualAccuracy}%
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.visualAccuracy}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400 pt-1 font-mono">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Hits</span>
                <span className="text-emerald-400 font-bold">{stats.visualHits}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Misses</span>
                <span className="text-rose-400 font-bold">{stats.visualMisses}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">False</span>
                <span className="text-amber-400 font-bold">{stats.visualFalseAlarms}</span>
              </div>
            </div>
          </div>

          {/* Audio Channel Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
              <div className="flex items-center gap-1.5">
                <Headphones className="w-4 h-4" />
                <span>MEDICAL SOUND</span>
              </div>
              <span className="font-mono text-base font-bold text-white">
                {stats.audioAccuracy}%
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.audioAccuracy}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-400 pt-1 font-mono">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Hits</span>
                <span className="text-emerald-400 font-bold">{stats.audioHits}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Misses</span>
                <span className="text-rose-400 font-bold">{stats.audioMisses}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">False</span>
                <span className="text-amber-400 font-bold">{stats.audioFalseAlarms}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Trial-by-Trial Replay Tape */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Trial History Tape</span>
            <span className="text-[11px] text-slate-500">Click trial for audit</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto p-2 bg-slate-950/70 border border-slate-800 rounded-xl scrollbar-thin">
            {trials.map((t, idx) => {
              const isBuffer = idx < stats.nLevel;
              const isSelected = selectedTrialIdx === idx;

              let statusColor = 'bg-slate-800 text-slate-400';
              if (!isBuffer) {
                const visOk = t.visualResult === 'hit' || t.visualResult === 'correct_rejection';
                const audOk = t.audioResult === 'hit' || t.audioResult === 'correct_rejection';
                if (visOk && audOk) {
                  statusColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50';
                } else if (!visOk && !audOk) {
                  statusColor = 'bg-rose-950/80 text-rose-400 border-rose-500/50';
                } else {
                  statusColor = 'bg-amber-950/80 text-amber-400 border-amber-500/50';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTrialIdx(idx)}
                  className={`flex-shrink-0 w-8 h-9 rounded-lg border flex flex-col items-center justify-center transition-all ${statusColor} ${
                    isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'hover:opacity-80'
                  }`}
                >
                  <span className="text-[9px] font-mono leading-none">{idx + 1}</span>
                  <span className="text-[8px] font-bold uppercase leading-none mt-1">
                    {MEDICAL_DICTIONARY[t.sound]?.display.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Audit Detail Panel for selected trial */}
          {selectedTrial && (
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-xs flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>Trial #{selectedTrial.index + 1}</span>
                {selectedTrial.index >= stats.nLevel ? (
                  <span>Comparing with Trial #{selectedTrial.index + 1 - stats.nLevel}</span>
                ) : (
                  <span className="text-slate-500">Baseline Buffer Trial</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Visual Position Comparison */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 grid grid-cols-3 grid-rows-3 gap-0.5 p-1 bg-slate-900 border border-slate-800 rounded">
                    {Array.from({ length: 9 }).map((_, p) => (
                      <div
                        key={p}
                        className={`rounded-[1px] ${
                          selectedTrial.position === p
                            ? 'bg-cyan-400'
                            : targetTrial?.position === p
                            ? 'bg-slate-600'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Position Match?</span>
                    <span className={`font-semibold ${selectedTrial.isVisualMatch ? 'text-teal-400' : 'text-slate-400'}`}>
                      {selectedTrial.isVisualMatch ? 'Yes (Match)' : 'No match'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      You pressed: {selectedTrial.userVisualResponse ? 'Yes' : 'No'} ({selectedTrial.visualResult})
                    </span>
                  </div>
                </div>

                {/* Sound Comparison */}
                <div>
                  <span className="text-slate-400 block text-[10px]">Sound Word</span>
                  <span className="font-semibold text-indigo-300">
                    {MEDICAL_DICTIONARY[selectedTrial.sound]?.display}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Match? {selectedTrial.isAudioMatch ? 'Yes' : 'No'} · Result: {selectedTrial.audioResult}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onNextRound}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 select-none active:scale-[0.98]"
          >
            <span>Next Round (N={stats.nextNLevel})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition-all flex items-center justify-center gap-2 select-none"
          >
            {copiedShare ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Results</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenGlossary}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Glossary</span>
          </button>
        </div>

      </div>
    </div>
  );
};
