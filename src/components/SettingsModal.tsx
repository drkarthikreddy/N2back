import React, { useState, useEffect } from 'react';
import { X, Sliders, Volume2, Gauge, Zap, Check, RotateCcw } from 'lucide-react';
import { GameSettings, MedicalWord } from '../types/game';
import { MEDICAL_WORDS, MEDICAL_DICTIONARY } from '../data/medicalTerms';
import { getAvailableVoices, playMedicalSpeech } from '../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onClose: () => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  onResetDefaults,
}) => {
  const [current, setCurrent] = useState<GameSettings>({ ...settings });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testPlaying, setTestPlaying] = useState<MedicalWord | null>(null);

  useEffect(() => {
    const list = getAvailableVoices();
    setVoices(list);
  }, []);

  const handleTestSound = (word: MedicalWord) => {
    setTestPlaying(word);
    playMedicalSpeech(word, current.audioVolume, current.selectedVoiceURI).finally(() => {
      setTestPlaying(null);
    });
  };

  const handleApply = () => {
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Customizable Game Settings</h2>
              <p className="text-xs text-slate-400">Tailor N-back parameters, speed interval & audio</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: N-Level selection */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">N-Back Level</h4>
              <p className="text-[11px] text-slate-400">Number of steps back you must recall and match</p>
            </div>
            <span className="font-mono text-base font-extrabold text-teal-400">
              N={current.nLevel}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setCurrent({ ...current, nLevel: lvl })}
                className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                  current.nLevel === lvl
                    ? 'bg-teal-500 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                N={lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 2: Session Length / Trials */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Session Length (Trials per Round)</h4>
              <p className="text-[11px] text-slate-400">Scientific standard is 20 to 25 trials per block</p>
            </div>
            <span className="font-mono text-sm font-bold text-cyan-400">
              {current.trialsPerRound} trials
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[15, 20, 25, 30].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setCurrent({ ...current, trialsPerRound: count })}
                className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  current.trialsPerRound === count
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {count} Trials
              </button>
            ))}
          </div>
        </div>

        {/* Setting 3: Speed Interval (Trial Duration) */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Speed Interval (Pacing)</h4>
              <p className="text-[11px] text-slate-400">Time window available for each trial stimulus & response</p>
            </div>
            <span className="font-mono text-sm font-bold text-indigo-400">
              {(current.trialDurationMs / 1000).toFixed(1)}s
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { label: 'Fast (1.8s)', ms: 1800 },
              { label: 'Normal (2.2s)', ms: 2200 },
              { label: 'Relaxed (2.8s)', ms: 2800 },
              { label: 'Slow (3.5s)', ms: 3500 },
            ].map((option) => (
              <button
                key={option.ms}
                type="button"
                onClick={() => setCurrent({ ...current, trialDurationMs: option.ms })}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition-all text-center truncate ${
                  current.trialDurationMs === option.ms
                    ? 'bg-indigo-500 text-white font-bold'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 4: Toggles (Immediate Feedback & Auto-Adaptive) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Immediate Feedback */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Immediate Feedback</h4>
              <p className="text-[10px] text-slate-400">Flash green/red cue on tap</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrent({ ...current, immediateFeedback: !current.immediateFeedback })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                current.immediateFeedback ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  current.immediateFeedback ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Auto Adaptive Progression */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Auto-Adaptive Difficulty</h4>
              <p className="text-[10px] text-slate-400">Auto level up at ≥80%</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrent({ ...current, autoAdaptive: !current.autoAdaptive })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                current.autoAdaptive ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  current.autoAdaptive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Setting 5: Audio Volume & Voice selection */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              Medical Audio Stimuli Volume
            </h4>
            <span className="font-mono text-xs text-slate-400">
              {Math.round(current.audioVolume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={current.audioVolume}
            onChange={(e) => setCurrent({ ...current, audioVolume: parseFloat(e.target.value) })}
            className="w-full accent-teal-400 cursor-pointer"
          />

          {voices.length > 0 && (
            <div className="flex flex-col gap-1 pt-1">
              <label className="text-[11px] text-slate-400">Speech Synthesis Voice:</label>
              <select
                value={current.selectedVoiceURI || ''}
                onChange={(e) => setCurrent({ ...current, selectedVoiceURI: e.target.value || null })}
                className="w-full py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-400"
              >
                <option value="">Default Natural Voice</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Sound Check Buttons */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-1.5 uppercase font-mono">
              Quick Sound Verification (Tap to listen)
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {MEDICAL_WORDS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleTestSound(w)}
                  className={`py-1 px-1 rounded bg-slate-900 border text-[11px] font-mono font-bold truncate transition-colors ${
                    testPlaying === w
                      ? 'border-teal-400 text-teal-300 bg-teal-950/40'
                      : 'border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {MEDICAL_DICTIONARY[w].display}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="py-2 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-md transition-colors"
            >
              Apply Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
