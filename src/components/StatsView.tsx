import React from 'react';
import { UserProgress, SessionStats } from '../types/game';
import { TrendingUp, Flame, Award, Calendar, BarChart3, CheckCircle2, RotateCcw } from 'lucide-react';

interface StatsViewProps {
  progress: UserProgress;
  onStartTraining: () => void;
  onResetHistory: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  progress,
  onStartTraining,
  onResetHistory,
}) => {
  const history = progress.sessionsHistory;
  const recentHistory = [...history].reverse(); // Oldest to newest for charts

  // Calculate overall metrics
  const avgAccuracy = history.length > 0
    ? Math.round(history.reduce((acc, s) => acc + s.combinedAccuracy, 0) / history.length)
    : 0;

  const avgVisual = history.length > 0
    ? Math.round(history.reduce((acc, s) => acc + s.visualAccuracy, 0) / history.length)
    : 0;

  const avgAudio = history.length > 0
    ? Math.round(history.reduce((acc, s) => acc + s.audioAccuracy, 0) / history.length)
    : 0;

  // Render SVG chart of recent sessions (up to last 15)
  const chartPoints = recentHistory.slice(-15);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Highest N-Level */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peak Level</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold font-mono text-white">
              N={progress.highestNLevel}
            </span>
            <span className="text-[11px] text-slate-500 block">Working memory ceiling</span>
          </div>
        </div>

        {/* Current Active N-Level */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Current Level</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold font-mono text-teal-400">
              N={progress.currentNLevel}
            </span>
            <span className="text-[11px] text-slate-500 block">Adaptive baseline</span>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold font-mono text-white">
              {progress.currentStreakDays} <span className="text-sm font-normal text-slate-400">days</span>
            </span>
            <span className="text-[11px] text-slate-500 block">Neuroplastic habit</span>
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mean Accuracy</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold font-mono text-cyan-400">
              {avgAccuracy}%
            </span>
            <span className="text-[11px] text-slate-500 block">{progress.totalSessionsPlayed} sessions total</span>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Cognitive Performance Curve</h3>
            <p className="text-xs text-slate-400">N-Back Level & Accuracy trajectory across recent training sessions</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-teal-400 inline-block rounded" />
              <span className="text-slate-400">N-Level</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400/60 inline-block rounded" />
              <span className="text-slate-400">Accuracy %</span>
            </div>
          </div>
        </div>

        {chartPoints.length > 1 ? (
          <div className="w-full h-48 relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
              {/* Grid guide lines */}
              {[0, 40, 80, 120, 160].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="500"
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Accuracy Area & Line */}
              {(() => {
                const maxAcc = 100;
                const points = chartPoints.map((s, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 500;
                  const y = 160 - (s.combinedAccuracy / maxAcc) * 140;
                  return `${x},${y}`;
                });
                return (
                  <>
                    <polyline
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeOpacity="0.7"
                      points={points.join(' ')}
                    />
                    {chartPoints.map((s, idx) => {
                      const x = (idx / (chartPoints.length - 1)) * 500;
                      const y = 160 - (s.combinedAccuracy / maxAcc) * 140;
                      return (
                        <circle
                          key={`acc_${idx}`}
                          cx={x}
                          cy={y}
                          r="3"
                          className="fill-cyan-400"
                        />
                      );
                    })}
                  </>
                );
              })()}

              {/* N-Level Line */}
              {(() => {
                const maxN = Math.max(5, ...chartPoints.map(s => s.nLevel));
                const points = chartPoints.map((s, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 500;
                  const y = 150 - (s.nLevel / maxN) * 130;
                  return `${x},${y}`;
                });
                return (
                  <>
                    <polyline
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="3.5"
                      points={points.join(' ')}
                    />
                    {chartPoints.map((s, idx) => {
                      const x = (idx / (chartPoints.length - 1)) * 500;
                      const y = 150 - (s.nLevel / maxN) * 130;
                      return (
                        <g key={`n_${idx}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            className="fill-slate-900 stroke-teal-400"
                            strokeWidth="2.5"
                          />
                          <text
                            x={x}
                            y={y - 8}
                            textAnchor="middle"
                            className="fill-teal-300 font-mono text-[9px] font-bold"
                          >
                            N={s.nLevel}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/80">
            <p>Complete at least 2 sessions to generate your visual cognitive trajectory.</p>
            <button
              type="button"
              onClick={onStartTraining}
              className="mt-3 px-4 py-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 font-semibold text-xs hover:bg-teal-500/30 transition-colors"
            >
              Start Training Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/50">
            <span className="text-slate-400">Mean Visual Spatial Accuracy:</span>
            <span className="font-mono font-bold text-cyan-400">{avgVisual}%</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/50">
            <span className="text-slate-400">Mean Medical Auditory Accuracy:</span>
            <span className="font-mono font-bold text-indigo-400">{avgAudio}%</span>
          </div>
        </div>
      </div>

      {/* Session History Log Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Session History Log</h3>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onResetHistory}
              className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Log</span>
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-[11px] font-mono text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3">Visual Pos</th>
                  <th className="py-2.5 px-3">Med Sound</th>
                  <th className="py-2.5 px-3">Overall</th>
                  <th className="py-2.5 px-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {history.slice(0, 10).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400">{s.date}</td>
                    <td className="py-2.5 px-3 font-bold text-white">N={s.nLevel}</td>
                    <td className="py-2.5 px-3 text-cyan-300">{s.visualAccuracy}%</td>
                    <td className="py-2.5 px-3 text-indigo-300">{s.audioAccuracy}%</td>
                    <td className="py-2.5 px-3 font-bold text-teal-300">{s.combinedAccuracy}%</td>
                    <td className="py-2.5 px-3">
                      {s.levelChange === 'promoted' && (
                        <span className="text-[10px] text-emerald-400 font-semibold">Promoted ↑</span>
                      )}
                      {s.levelChange === 'demoted' && (
                        <span className="text-[10px] text-amber-400 font-semibold">Demoted ↓</span>
                      )}
                      {s.levelChange === 'maintained' && (
                        <span className="text-[10px] text-slate-400">Maintained</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            No training sessions recorded yet. Play a round to build your clinical memory stats!
          </div>
        )}
      </div>
    </div>
  );
};
