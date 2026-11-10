/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, SpeakingAssessmentReport } from './types';
import { storageService } from './services/storageService';
import { voiceService } from './services/voiceService';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { LearnTab } from './components/LearnTab';
import { SpeakTab } from './components/SpeakTab';
import { ProgressTab } from './components/ProgressTab';
import { ProfileTab } from './components/ProfileTab';
import { OnboardingModal } from './components/OnboardingModal';
import { ThinkAndSpeakModal } from './components/ThinkAndSpeakModal';
import { PronunciationModal } from './components/PronunciationModal';
import { GrammarDoctorModal } from './components/GrammarDoctorModal';
import { VocabBuilderModal } from './components/VocabBuilderModal';
import { AssessmentModal } from './components/AssessmentModal';
import { TutorDrawer } from './components/TutorDrawer';
import { VoiceCallModal } from './components/VoiceCallModal';
import { FunZoneModal } from './components/FunZoneModal';
import { Wifi, Battery, Signal } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  // Modal and drawer visibility - auto-open onboarding on app launch if learner has not set preferences
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    const prof = storageService.getProfile();
    return !prof.onboarded;
  });
  const [showVoiceCallModal, setShowVoiceCallModal] = useState<boolean>(false);
  const [showFunZoneModal, setShowFunZoneModal] = useState<boolean>(false);
  const [showThinkSpeakModal, setShowThinkSpeakModal] = useState<boolean>(false);
  const [showPronunciationModal, setShowPronunciationModal] = useState<boolean>(false);
  const [showGrammarModal, setShowGrammarModal] = useState<boolean>(false);
  const [showVocabModal, setShowVocabModal] = useState<boolean>(false);
  const [activeAssessmentReport, setActiveAssessmentReport] = useState<SpeakingAssessmentReport | null>(null);
  const [showTutorDrawer, setShowTutorDrawer] = useState<boolean>(false);

  // Status bar clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  // Update profile in state and storage
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    storageService.saveProfile(updated);
  };

  const handleAddXP = (amount: number) => {
    const updated = storageService.addXP(amount);
    setProfile({ ...updated });
  };

  const handleLessonComplete = (lessonId: string, xpReward: number) => {
    const updated = storageService.completeLesson(lessonId, xpReward);
    setProfile({ ...updated });
  };

  // The main screen content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            profile={profile}
            onSelectTab={setActiveTab}
            onStartVoiceCall={() => setShowVoiceCallModal(true)}
            onOpenFunZone={() => setShowFunZoneModal(true)}
            onOpenThinkSpeak={() => setShowThinkSpeakModal(true)}
            onOpenPronunciation={() => setShowPronunciationModal(true)}
            onOpenGrammar={() => setShowGrammarModal(true)}
            onOpenVocab={() => setShowVocabModal(true)}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'learn':
        return (
          <LearnTab
            profile={profile}
            onAddXP={handleAddXP}
            onLessonComplete={handleLessonComplete}
          />
        );
      case 'speak':
        return (
          <SpeakTab
            profile={profile}
            onOpenAssessment={(report) => setActiveAssessmentReport(report)}
            onAddXP={handleAddXP}
          />
        );
      case 'progress':
        return (
          <ProgressTab
            profile={profile}
            assessments={storageService.getAssessments()}
            onOpenAssessment={(report) => setActiveAssessmentReport(report)}
          />
        );
      case 'profile':
        return (
          <ProfileTab
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onOpenOnboarding={() => setShowOnboarding(true)}
            onOpenTutorDrawer={() => setShowTutorDrawer(true)}
          />
        );
      default:
        return null;
    }
  };

  const appContent = (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-150">
      
      {/* Android Device Status Bar (shown when mobile frame is active) */}
      {isMobileFrame && (
        <div className="bg-slate-900/95 px-6 pt-2 pb-1.5 flex items-center justify-between text-xs text-slate-400 select-none border-b border-slate-800">
          <span className="font-semibold text-white">{currentTime}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Primary Header Bar */}
      <Navbar
        profile={profile}
        isMobileFrame={isMobileFrame}
        onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenTutorDrawer={() => setShowTutorDrawer(true)}
        onStartVoiceCall={() => setShowVoiceCallModal(true)}
        onOpenFunZone={() => setShowFunZoneModal(true)}
      />

      {/* Main Tab Viewport */}
      <main className="flex-1 overflow-x-hidden">
        {renderTabContent()}
      </main>

      {/* 5-Tab Material Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Modals & Slide-out Drawers */}
      {showOnboarding && (
        <OnboardingModal
          initialProfile={profile}
          canCancel={Boolean(profile.onboarded)}
          onComplete={(updated, shouldStartCall) => {
            handleUpdateProfile({ ...updated, onboarded: true });
            setShowOnboarding(false);
            if (shouldStartCall) {
              setShowVoiceCallModal(true);
            }
          }}
          onCancel={() => setShowOnboarding(false)}
        />
      )}

      {showVoiceCallModal && (
        <VoiceCallModal
          profile={profile}
          scenarioTitle="Daily Speaking Practice with Ava"
          onClose={() => setShowVoiceCallModal(false)}
          onAddXP={handleAddXP}
        />
      )}

      {showFunZoneModal && (
        <FunZoneModal
          profile={profile}
          onClose={() => setShowFunZoneModal(false)}
          onAddXP={handleAddXP}
        />
      )}

      {showThinkSpeakModal && (
        <ThinkAndSpeakModal
          profile={profile}
          onClose={() => setShowThinkSpeakModal(false)}
          onAddXP={handleAddXP}
        />
      )}

      {showPronunciationModal && (
        <PronunciationModal
          profile={profile}
          onClose={() => setShowPronunciationModal(false)}
          onAddXP={handleAddXP}
        />
      )}

      {showGrammarModal && (
        <GrammarDoctorModal
          profile={profile}
          onClose={() => setShowGrammarModal(false)}
          onAddXP={handleAddXP}
        />
      )}

      {showVocabModal && (
        <VocabBuilderModal
          profile={profile}
          onClose={() => setShowVocabModal(false)}
          onAddXP={handleAddXP}
        />
      )}

      {activeAssessmentReport && (
        <AssessmentModal
          report={activeAssessmentReport}
          onClose={() => setActiveAssessmentReport(null)}
          onStartRecommendedPractice={(scenario) => {
            setActiveTab('speak');
          }}
        />
      )}

      <TutorDrawer
        profile={profile}
        isOpen={showTutorDrawer}
        onClose={() => setShowTutorDrawer(false)}
        onAddXP={handleAddXP}
      />

    </div>
  );

  // If mobile frame is active, wrap in realistic Android phone container
  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6">
        <div className="relative w-full max-w-[430px] h-[92vh] max-h-[890px] rounded-[48px] border-[10px] border-slate-800 shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col bg-slate-950 ring-1 ring-slate-700">
          {/* Top Speaker / Camera Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-slate-900 z-50 flex items-center justify-center">
            <div className="w-10 h-1 rounded-full bg-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-850 ml-2" />
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {appContent}
          </div>
        </div>
      </div>
    );
  }

  return appContent;
}
