import React from 'react';
import { Home, BookOpen, Mic, BarChart2, User } from 'lucide-react';
import { voiceService } from '../services/voiceService';

export type TabType = 'home' | 'learn' | 'speak' | 'progress' | 'profile';

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onChangeTab }) => {
  const handleTabClick = (tab: TabType) => {
    voiceService.playSfx('tap');
    onChangeTab(tab);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto px-4 pb-3 pt-1 pointer-events-none">
      <nav className="pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 rounded-3xl shadow-2xl px-2 py-1.5 flex items-center justify-around">
        
        {/* 1. HOME */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'home'
              ? 'text-indigo-400 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium mt-0.5">Home</span>
        </button>

        {/* 2. LEARN */}
        <button
          onClick={() => handleTabClick('learn')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'learn'
              ? 'text-indigo-400 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'learn' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium mt-0.5">Learn</span>
        </button>

        {/* 3. SPEAK (VISUALLY PROMINENT) */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={() => handleTabClick('speak')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
              activeTab === 'speak'
                ? 'bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 text-white shadow-purple-500/50 scale-110 ring-4 ring-indigo-400/30'
                : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:scale-105'
            }`}
          >
            <Mic className="w-7 h-7 text-white stroke-[2.5] animate-pulse" />
          </button>
          <span className={`text-[11px] font-bold mt-1 ${activeTab === 'speak' ? 'text-indigo-400 font-extrabold' : 'text-slate-300'}`}>
            Speak
          </span>
        </div>

        {/* 4. PROGRESS */}
        <button
          onClick={() => handleTabClick('progress')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'progress'
              ? 'text-indigo-400 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className={`w-5 h-5 ${activeTab === 'progress' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium mt-0.5">Progress</span>
        </button>

        {/* 5. PROFILE */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'profile'
              ? 'text-indigo-400 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] font-medium mt-0.5">Profile</span>
        </button>

      </nav>
    </div>
  );
};
