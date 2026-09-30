import React, { useState } from 'react';
import { X, Volume2, BookOpen, Stethoscope, Search, ShieldAlert, HeartPulse, Dna } from 'lucide-react';
import { MEDICAL_WORDS, MEDICAL_DICTIONARY } from '../data/medicalTerms';
import { playMedicalSpeech } from '../utils/audio';
import { MedicalWord } from '../types/game';

interface GlossaryModalProps {
  onClose: () => void;
  audioVolume: number;
  voiceURI?: string | null;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  onClose,
  audioVolume,
  voiceURI,
}) => {
  const [search, setSearch] = useState('');
  const [playingWord, setPlayingWord] = useState<MedicalWord | null>(null);

  const filteredWords = MEDICAL_WORDS.filter((w) => {
    const info = MEDICAL_DICTIONARY[w];
    const q = search.toLowerCase();
    return (
      info.display.toLowerCase().includes(q) ||
      info.fullName.toLowerCase().includes(q) ||
      info.category.toLowerCase().includes(q)
    );
  });

  const handlePronounce = (word: MedicalWord) => {
    setPlayingWord(word);
    playMedicalSpeech(word, audioVolume, voiceURI).finally(() => {
      setPlayingWord(null);
    });
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'Cardiology') return <HeartPulse className="w-4 h-4 text-rose-400" />;
    if (category.includes('Oncology')) return <Dna className="w-4 h-4 text-purple-400" />;
    return <ShieldAlert className="w-4 h-4 text-teal-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Clinical Glossary & Sound Reference</h2>
              <p className="text-xs text-slate-400">The 9 medical conditions featured as auditory stimuli</p>
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

        {/* Search Filter */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search medical conditions (e.g. Dengue, CML, Cardiology)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
          />
        </div>

        {/* Glossary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredWords.map((w) => {
            const item = MEDICAL_DICTIONARY[w];
            const isSpeaking = playingWord === w;

            return (
              <div
                key={w}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3 hover:border-slate-700/80 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold font-mono tracking-tight text-white">
                          {item.display}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </div>
                      </div>
                      <h3 className="text-xs font-semibold text-cyan-300 mt-0.5">
                        {item.fullName}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePronounce(w)}
                      className={`p-2 rounded-lg border transition-all ${
                        isSpeaking
                          ? 'bg-teal-500 text-slate-950 border-teal-400 animate-pulse'
                          : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                      title={`Listen to pronunciation for ${item.display}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {item.overview}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                    Hallmark Signs & Symptoms
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.symptoms.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-slate-300 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
          <span>9 Clinical audio stimuli active</span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
