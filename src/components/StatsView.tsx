import React from 'react';
import { UserProgress } from '../types/game';
import { TrendingUp, Flame, Award, BarChart3, RotateCcw, Play } from 'lucide-react';

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
  const recentHistory = [...history].reverse();

  const avgAccuracy = history.length > 0
    ? Math.round(history.reduce((acc, s) => acc + s.combinedAccuracy, 0) / history.length)
    : 0;

  const chartPoints = recentHistory.slice(-12);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4 animate-in fade-in duration-150 p-2 overflow-y-auto max-h-[calc(100dvh-120px)]">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000000] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-600">
            <span>Peak Level</span>
            <Award className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-2xl font-black font-mono text-black mt-1">
            N={progress.highestNLevel}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000000] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-600">
            <span>Current Level</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-2xl font-black font-mono text-orange-600 mt-1">
            N={progress.currentNLevel}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000000] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-600">
            <span>Streak</span>
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-2xl font-black font-mono text-black mt-1">
            {progress.currentStreakDays} <span className="text-xs font-bold text-zinc-500">days</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000000] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-600">
            <span>Avg Accuracy</span>
            <BarChart3 className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-2xl font-black font-mono text-black mt-1">
            {avgAccuracy}%
          </span>
        </div>
      </div>

      {/* SVG Trajectory Chart */}
      <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000000] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-black">Working Memory Trajectory</span>
          <span className="text-[10px] font-mono font-bold text-orange-600">N-Level & Accuracy</span>
        </div>

        {chartPoints.length > 1 ? (
          <div className="w-full h-32 relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
              {/* Guides */}
              {[0, 40, 80, 120].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="400"
                  y2={y}
                  stroke="#e4e4e7"
                  strokeWidth="1"
                />
              ))}

              {/* Accuracy Polyline */}
              {(() => {
                const points = chartPoints.map((s, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 400;
                  const y = 120 - (s.combinedAccuracy / 100) * 100;
                  return `${x},${y}`;
                });
                return (
                  <polyline
                    fill="none"
                    stroke="#a1a1aa"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    points={points.join(' ')}
                  />
                );
              })()}

              {/* N-Level Line */}
              {(() => {
                const maxN = Math.max(5, ...chartPoints.map(s => s.nLevel));
                const points = chartPoints.map((s, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 400;
                  const y = 110 - (s.nLevel / maxN) * 90;
                  return `${x},${y}`;
                });
                return (
                  <>
                    <polyline
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="3.5"
                      points={points.join(' ')}
                    />
                    {chartPoints.map((s, idx) => {
                      const x = (idx / (chartPoints.length - 1)) * 400;
                      const y = 110 - (s.nLevel / maxN) * 90;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="4"
                          className="fill-white stroke-orange-600 stroke-[3]"
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center text-xs text-zinc-500 font-medium">
            Complete at least 2 sessions to see performance curve.
          </div>
        )}
      </div>

      {/* History Log */}
      <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000000] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-black">Recent Sessions</span>
          {history.length > 0 && (
            <button
              type="button"
              onClick={onResetHistory}
              className="text-[11px] font-bold text-zinc-500 hover:text-black flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono text-zinc-500 uppercase border-b border-zinc-200">
                <tr>
                  <th className="py-1.5 px-2">Date</th>
                  <th className="py-1.5 px-2">Level</th>
                  <th className="py-1.5 px-2">Visual</th>
                  <th className="py-1.5 px-2">Sound</th>
                  <th className="py-1.5 px-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono text-xs">
                {history.slice(0, 8).map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 px-2 text-zinc-600">{s.date.slice(5)}</td>
                    <td className="py-2 px-2 font-black text-orange-600">N={s.nLevel}</td>
                    <td className="py-2 px-2">{s.visualAccuracy}%</td>
                    <td className="py-2 px-2">{s.audioAccuracy}%</td>
                    <td className="py-2 px-2 font-bold text-black">{s.combinedAccuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <span className="text-xs text-zinc-500 py-2">No history recorded yet.</span>
        )}
      </div>

      {/* Action to Return to Play */}
      <button
        type="button"
        onClick={onStartTraining}
        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_3px_0_#9a3412] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Return to Training</span>
      </button>

    </div>
  );
};
