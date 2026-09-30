import React, { useState } from 'react';
import { X, Volume2, Sparkles, Brain, CheckCircle2, ArrowRight } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'how_to_play' | 'soundboard' | 'science'>('how_to_play');

  const testWord = (word: MedicalWord) => {
    setPlayingWord(word);
    playMedicalSpeech(word, audioVolume, voiceURI).finally(() => {
      setPlayingWord(null);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">How to Play Medical Dual N-Back</h2>
              <p className="text-xs text-slate-400">Scientifically studied working memory and focus workout</p>
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('how_to_play')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'how_to_play'
                ? 'bg-slate-800 text-teal-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dual N-Back Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('soundboard')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'soundboard'
                ? 'bg-slate-800 text-teal-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            9 Medical Sounds
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('science')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'science'
                ? 'bg-slate-800 text-teal-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cognitive Science
          </button>
        </div>

        {/* Tab 1: How to play */}
        {activeTab === 'how_to_play' && (
          <div className="flex flex-col gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <h3 className="text-sm font-bold text-teal-400 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                The Core Objective
              </h3>
              <p>
                In Dual N-Back, you track two independent streams of information simultaneously:
                <strong className="text-cyan-300 font-medium"> 3×3 Visual Positions </strong> and
                <strong className="text-indigo-300 font-medium"> Spoken Medical Words</strong>.
              </p>
              <p className="mt-1">
                Your goal is to press the corresponding button whenever the current stimulus matches what occurred <strong>exactly N steps ago</strong>.
              </p>
            </div>

            {/* Visual Example for N=2 */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                Example: Training on N=2
              </span>

              <div className="grid grid-cols-3 gap-2">
                {/* Step 1 */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-500 mb-1">Turn 1 (T-2)</span>
                  <div className="w-12 h-12 grid grid-cols-3 grid-rows-3 gap-0.5 bg-slate-950 p-1 rounded border border-slate-800 mb-1.5">
                    <div className="bg-teal-400 rounded-sm" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="bg-slate-800 rounded-sm" />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] font-bold text-indigo-300">"TB"</span>
                  <span className="text-[9px] text-slate-500 mt-1">Memorize</span>
                </div>

                {/* Step 2 */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-500 mb-1">Turn 2 (T-1)</span>
                  <div className="w-12 h-12 grid grid-cols-3 grid-rows-3 gap-0.5 bg-slate-950 p-1 rounded border border-slate-800 mb-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-slate-800 rounded-sm" />
                    ))}
                    <div className="bg-teal-400 rounded-sm" />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-slate-800 rounded-sm" />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] font-bold text-indigo-300">"MI"</span>
                  <span className="text-[9px] text-slate-500 mt-1">Memorize</span>
                </div>

                {/* Step 3 (Comparison Turn) */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-teal-500/40 flex flex-col items-center ring-1 ring-teal-500/30">
                  <span className="text-[10px] font-mono text-teal-400 mb-1 font-bold">Turn 3 (NOW)</span>
                  <div className="w-12 h-12 grid grid-cols-3 grid-rows-3 gap-0.5 bg-slate-950 p-1 rounded border border-slate-800 mb-1.5">
                    <div className="bg-teal-400 rounded-sm" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="bg-slate-800 rounded-sm" />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] font-bold text-indigo-300">"Dengue"</span>
                  <span className="text-[9px] text-teal-400 font-semibold mt-1">Position Match! [A]</span>
                </div>
              </div>

              <div className="mt-3 p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                👉 On Turn 3, the visual position (top-left) matches Turn 1 (2 steps ago) — <strong>press [A] (Position)</strong>!
                The audio ("Dengue" vs "TB") does not match — <strong>do not press [L]</strong>.
              </div>
            </div>

            {/* Controls reminder */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <kbd className="px-2 py-1 text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-cyan-300 rounded">
                  A
                </kbd>
                <div>
                  <strong className="text-white block font-semibold">Position Match</strong>
                  <span className="text-slate-400 text-[11px]">Press when the visual square is at the same grid position as N turns ago.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                <kbd className="px-2 py-1 text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-indigo-300 rounded">
                  L
                </kbd>
                <div>
                  <strong className="text-white block font-semibold">Sound Match</strong>
                  <span className="text-slate-400 text-[11px]">Press when the spoken medical term is identical to the one N turns ago.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 9 Medical Sounds Soundboard */}
        {activeTab === 'soundboard' && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-300">
              Listen to the 9 high-frequency medical stimuli used in this protocol. Tap any sound to test pronunciation:
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {MEDICAL_WORDS.map((w) => {
                const info = MEDICAL_DICTIONARY[w];
                const isPlaying = playingWord === w;

                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => testWord(w)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all select-none ${
                      isPlaying
                        ? 'bg-teal-500/20 border-teal-400 text-white shadow-md'
                        : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold tracking-wide font-mono text-cyan-400">
                        {info.display}
                      </span>
                      <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-teal-400 animate-pulse' : 'text-slate-500'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                      {info.fullName}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
              💡 <strong>Pro Tip:</strong> Using actual medical condition sounds creates dual encoding in both the phonological loop and medical knowledge semantic networks.
            </div>
          </div>
        )}

        {/* Tab 3: Cognitive Science */}
        {activeTab === 'science' && (
          <div className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-2">Why Train Working Memory?</h4>
              <p>
                Working memory is the mental workbench where information is simultaneously held, inspected, and updated. Research (such as Jaeggi et al.) demonstrated that structured Dual N-Back practice can improve:
              </p>
              <ul className="mt-2 space-y-1.5 text-slate-300 list-disc list-inside">
                <li><strong className="text-teal-300">Fluid Intelligence (Gf):</strong> The ability to reason through novel clinical and technical situations.</li>
                <li><strong className="text-teal-300">Attentional Control:</strong> Filtering out irrelevant distractions during high-stakes tasks.</li>
                <li><strong className="text-teal-300">Multimodal Processing:</strong> Coordinating spatial visual data with auditory language processing.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-1">Adaptive Progression</h4>
              <p>
                MedNBack continuously monitors your accuracy. Score <strong className="text-emerald-400">≥80%</strong> on both channels to advance to higher N levels. Fall below <strong className="text-rose-400">50%</strong> and the engine softens the difficulty so you maintain optimal neuroplastic growth.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-wide transition-colors"
          >
            Got It, Let's Train!
          </button>
        </div>

      </div>
    </div>
  );
};
