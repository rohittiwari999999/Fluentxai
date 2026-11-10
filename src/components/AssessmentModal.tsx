import React from 'react';
import { SpeakingAssessmentReport } from '../types';
import { X, Award, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface Props {
  report: SpeakingAssessmentReport;
  onClose: () => void;
  onStartRecommendedPractice?: (scenario: string) => void;
}

export const AssessmentModal: React.FC<Props> = ({
  report,
  onClose,
  onStartRecommendedPractice,
}) => {
  const metricsList = [
    { label: 'Fluency', value: report.metrics.fluency, color: 'from-blue-500 to-indigo-500' },
    { label: 'Grammar', value: report.metrics.grammar, color: 'from-emerald-500 to-teal-500' },
    { label: 'Vocabulary', value: report.metrics.vocabulary, color: 'from-purple-500 to-pink-500' },
    { label: 'Pronunciation', value: report.metrics.pronunciation, color: 'from-cyan-500 to-blue-500' },
    { label: 'Sentence Formation', value: report.metrics.sentenceFormation, color: 'from-amber-500 to-orange-500' },
    { label: 'Confidence', value: report.metrics.confidence, color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl text-white my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Speaking Assessment Report</h2>
              <p className="text-xs text-slate-400">
                Session: {report.scenario} • Duration: {report.durationMinutes} min
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Score & CEFR Badge */}
        <div className="mt-5 p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-purple-950/50 to-slate-900 border border-indigo-500/30 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full bg-slate-900/90 border-4 border-indigo-500 flex flex-col items-center justify-center shadow-xl shadow-indigo-500/20">
              <span className="text-2xl font-black text-white">{report.overallScore}</span>
              <span className="text-[10px] text-indigo-300 font-bold uppercase">Score</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black text-sm">
                  CEFR {report.cefrLevel}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {report.cefrLevel.startsWith('B') ? 'Independent User' : report.cefrLevel.startsWith('C') ? 'Proficient Speaker' : 'Basic Speaker'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Transparent multi-metric evaluation of your conversational turns.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
              <Sparkles className="w-3.5 h-3.5" /> +50 XP Bonus Awarded
            </span>
          </div>
        </div>

        {/* 6 Key Speaking Metrics */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Core Speaking Competencies
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {metricsList.map((m, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{m.label}</span>
                  <span className="font-bold text-white">{m.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                    style={{ width: `${m.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Speaking Strengths
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {report.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold shrink-0">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Areas for Growth
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold shrink-0">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Notable Mistakes with Corrections */}
        {report.notableMistakes && report.notableMistakes.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Notable Mistakes Identified & Refined
            </div>
            <div className="space-y-2.5">
              {report.notableMistakes.map((mis, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
                    <span className="line-through">"{mis.said}"</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mb-1">
                    ✓ "{mis.corrected}"
                  </div>
                  <div className="text-slate-400 italic">
                    Why: {mis.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations & Action Plan */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Next Recommended Practice
          </div>
          <div className="text-sm font-bold text-white mb-1">
            {report.nextRecommendedPractice}
          </div>
          <div className="text-xs text-slate-400">
            {report.suggestions.join(' • ')}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              voiceService.playSfx('tap');
              onClose();
              if (onStartRecommendedPractice) {
                onStartRecommendedPractice(report.nextRecommendedPractice);
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            <span>Continue Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
