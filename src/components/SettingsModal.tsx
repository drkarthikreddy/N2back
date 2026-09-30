import React, { useState, useEffect } from 'react';
import { X, Sliders, Volume2, RotateCcw } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white border-2 border-black rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-5 flex flex-col gap-4 text-black">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-base font-black">Game Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* N-Level Selection */}
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black">N-Back Level</span>
            <span className="font-mono text-sm font-black text-orange-600">N={current.nLevel}</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setCurrent({ ...current, nLevel: lvl })}
                className={`py-1.5 rounded-lg text-xs font-mono font-black transition-all ${
                  current.nLevel === lvl
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white border border-zinc-300 text-zinc-800 hover:border-black'
                }`}
              >
                N={lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Session Length & Speed */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-black">Trials / Round</span>
            <div className="grid grid-cols-3 gap-1">
              {[15, 20, 25].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setCurrent({ ...current, trialsPerRound: cnt })}
                  className={`py-1 rounded-md text-xs font-mono font-bold ${
                    current.trialsPerRound === cnt
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-zinc-300 text-zinc-800'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-black">Speed Interval</span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: '1.8s', ms: 1800 },
                { label: '2.2s', ms: 2200 },
                { label: '2.8s', ms: 2800 },
              ].map((opt) => (
                <button
                  key={opt.ms}
                  type="button"
                  onClick={() => setCurrent({ ...current, trialDurationMs: opt.ms })}
                  className={`py-1 rounded-md text-xs font-mono font-bold ${
                    current.trialDurationMs === opt.ms
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-zinc-300 text-zinc-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Immediate Feedback & Adaptive Toggles */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <span className="text-xs font-bold text-black">Immediate Feedback</span>
            <button
              type="button"
              onClick={() => setCurrent({ ...current, immediateFeedback: !current.immediateFeedback })}
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                current.immediateFeedback ? 'bg-orange-500' : 'bg-zinc-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  current.immediateFeedback ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <span className="text-xs font-bold text-black">Auto-Adapt N</span>
            <button
              type="button"
              onClick={() => setCurrent({ ...current, autoAdaptive: !current.autoAdaptive })}
              className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                current.autoAdaptive ? 'bg-orange-500' : 'bg-zinc-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  current.autoAdaptive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Audio Volume & Sound test */}
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-black flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-orange-600" />
              Sound Volume
            </span>
            <span className="font-mono text-xs font-bold text-zinc-700">
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
            className="w-full accent-orange-500 cursor-pointer"
          />

          {voices.length > 0 && (
            <select
              value={current.selectedVoiceURI || ''}
              onChange={(e) => setCurrent({ ...current, selectedVoiceURI: e.target.value || null })}
              className="w-full py-1 px-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-black mt-1"
            >
              <option value="">Default Voice</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          )}

          {/* Clean 9-Word Sound Check */}
          <div className="pt-1">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block mb-1">
              Tap sound to preview:
            </span>
            <div className="grid grid-cols-5 gap-1">
              {MEDICAL_WORDS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => handleTestSound(w)}
                  className={`py-1 px-1 rounded border text-[11px] font-mono font-bold truncate transition-colors ${
                    testPlaying === w
                      ? 'bg-orange-500 text-white border-black'
                      : 'bg-white border-zinc-300 text-zinc-800 hover:border-black'
                  }`}
                >
                  {MEDICAL_DICTIONARY[w].display}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onResetDefaults}
            className="text-xs font-bold text-zinc-500 hover:text-black flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="py-2.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-[0_3px_0_#9a3412] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Apply Settings
          </button>
        </div>

      </div>
    </div>
  );
};
