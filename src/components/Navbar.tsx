import React from 'react';
import { UserProfile } from '../types';
import { Flame, Sparkles, Smartphone, Monitor, HelpCircle } from 'lucide-react';
import { voiceService } from '../services/voiceService';

interface Props {
  profile: UserProfile;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  onOpenOnboarding: () => void;
  onOpenTutorDrawer: () => void;
  onStartVoiceCall?: () => void;
  onOpenFunZone?: () => void;
}

export const Navbar: React.FC<Props> = ({
  profile,
  isMobileFrame,
  onToggleFrame,
  onOpenOnboarding,
  onOpenTutorDrawer,
  onStartVoiceCall,
  onOpenFunZone,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand Logo & Name */}
        <button
          onClick={() => {
            voiceService.playSfx('tap');
            onOpenOnboarding();
          }}
          className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
          title="Click to change your language & preferences"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-[#FF4B26] flex items-center justify-center shadow-lg shadow-indigo-500/30 font-black text-white text-lg tracking-wider">
            FX
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">FluentX</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[#FF4B26]/20 text-[#FF4B26] text-[10px] font-bold uppercase tracking-wider border border-[#FF4B26]/30">
                AI
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <span className="text-slate-200 font-semibold">{profile.name || profile.nativeLanguage}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{profile.englishLevel}</span>
            </div>
          </div>
        </button>

        {/* Right Stats & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Quick Call Ava Button */}
          {onStartVoiceCall && (
            <button
              onClick={() => {
                voiceService.playSfx('tap');
                onStartVoiceCall();
              }}
              title="Direct Phone Call with Ava"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all text-xs font-bold"
            >
              <span className="text-sm">📞</span>
              <span className="hidden sm:inline">Call Ava</span>
            </button>
          )}

          {/* Quick Fun Games Button */}
          {onOpenFunZone && (
            <button
              onClick={() => {
                voiceService.playSfx('tap');
                onOpenFunZone();
              }}
              title="Maje Maje Mein Games"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all text-xs font-bold"
            >
              <span className="text-sm">🎉</span>
              <span className="hidden sm:inline">Maje</span>
            </button>
          )}

          {/* Streak Flame */}
          <button
            onClick={() => {
              voiceService.playSfx('tap');
            }}
            title="Daily Active Streak"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-bold"
          >
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{profile.streak}d</span>
          </button>

          {/* XP Badge */}
          <div
            title="Total Learning XP"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{profile.xp} XP</span>
          </div>

          {/* Mobile Frame Toggle */}
          <button
            onClick={() => {
              voiceService.playSfx('tap');
              onToggleFrame();
            }}
            title={isMobileFrame ? 'Switch to Full Screen View' : 'Switch to Android Mobile Frame View'}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            {isMobileFrame ? (
              <Monitor className="w-4 h-4 text-slate-400" />
            ) : (
              <Smartphone className="w-4 h-4 text-indigo-400" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
