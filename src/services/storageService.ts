import { UserProfile, AchievementBadge, SpeakingAssessmentReport, VocabularyWord } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'fluentx_user_profile',
  ASSESSMENTS: 'fluentx_assessments',
  CUSTOM_VOCAB: 'fluentx_custom_vocab',
  CHAT_HISTORIES: 'fluentx_chat_histories',
  SETTINGS: 'fluentx_settings',
};

const DEFAULT_BADGES: AchievementBadge[] = [
  {
    id: 'first_words',
    title: 'First Words',
    description: 'Complete your first English speaking practice',
    icon: '🎙️',
    category: 'speaking',
    targetCount: 1,
    currentCount: 1,
    progress: 100,
    unlockedAt: new Date().toISOString(),
  },
  {
    id: 'streak_3',
    title: 'Consistency Spark',
    description: 'Keep a 3-day learning streak',
    icon: '🔥',
    category: 'streak',
    targetCount: 3,
    currentCount: 1,
    progress: 33,
  },
  {
    id: 'streak_7',
    title: 'Fluency Flame',
    description: 'Maintain a 7-day speaking streak',
    icon: '⚡',
    category: 'streak',
    targetCount: 7,
    currentCount: 1,
    progress: 14,
  },
  {
    id: 'avas_friend',
    title: "Ava's Partner",
    description: 'Have 5 voice conversations with Ava',
    icon: '💬',
    category: 'speaking',
    targetCount: 5,
    currentCount: 1,
    progress: 20,
  },
  {
    id: 'vocab_20',
    title: 'Word Collector',
    description: 'Master 20 new vocabulary words',
    icon: '📚',
    category: 'vocab',
    targetCount: 20,
    currentCount: 6,
    progress: 30,
  },
  {
    id: 'grammar_doctor',
    title: 'Grammar Ace',
    description: 'Analyze and fix 10 sentences with Grammar Doctor',
    icon: '🩺',
    category: 'mastery',
    targetCount: 10,
    currentCount: 2,
    progress: 20,
  },
  {
    id: 'pronounce_pro',
    title: 'Native Accent',
    description: 'Score 90%+ in 5 Pronunciation tests',
    icon: '🎯',
    category: 'speaking',
    targetCount: 5,
    currentCount: 1,
    progress: 20,
  },
  {
    id: 'curriculum_champ',
    title: 'Curriculum Star',
    description: 'Complete all units in your current level',
    icon: '🏆',
    category: 'lessons',
    targetCount: 4,
    currentCount: 1,
    progress: 25,
  },
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_' + Math.random().toString(36).substring(2, 9),
  name: '',
  gender: 'Male',
  ageGroup: '18-25',
  profession: 'Business Owner',
  nativeLanguage: 'Hindi',
  englishLevel: 'Beginner',
  levelHinglishDesc: 'Main english mein abhi beginner hoon',
  learningGoal: 'Daily Fluency',
  dailyTargetMinutes: 15,
  preferredStyle: 'Voice & Speaking First',
  xp: 50,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  activeDates: [new Date().toISOString().split('T')[0]],
  completedLessons: [],
  masteredVocabCount: 4,
  totalSpeakingMinutes: 0,
  unlockedBadges: [],
  currentUnitId: 'beg_u1',
  currentLessonId: 'beg_u1_l1',
  onboarded: false,
};

class StorageService {
  public getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading profile from localStorage:', e);
    }
    return DEFAULT_PROFILE;
  }

  public saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Error saving profile:', e);
    }
  }

  public addXP(amount: number): UserProfile {
    const profile = this.getProfile();
    profile.xp += amount;
    this.saveProfile(profile);
    return profile;
  }

  public completeLesson(lessonId: string, xpReward: number = 30): UserProfile {
    const profile = this.getProfile();
    if (!profile.completedLessons.includes(lessonId)) {
      profile.completedLessons.push(lessonId);
      profile.xp += xpReward;
      this.updateStreak();
    }
    this.saveProfile(profile);
    return profile;
  }

  public updateSpeakingMinutes(minutes: number): UserProfile {
    const profile = this.getProfile();
    profile.totalSpeakingMinutes += minutes;
    this.saveProfile(profile);
    return profile;
  }

  public updateStreak(): UserProfile {
    const profile = this.getProfile();
    const today = new Date().toISOString().split('T')[0];

    if (!profile.activeDates.includes(today)) {
      profile.activeDates.push(today);
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (profile.lastActiveDate === yesterday) {
        profile.streak += 1;
      } else if (profile.lastActiveDate !== today) {
        profile.streak = 1;
      }
      profile.lastActiveDate = today;
      this.saveProfile(profile);
    }
    return profile;
  }

  public getBadges(): AchievementBadge[] {
    const profile = this.getProfile();
    return DEFAULT_BADGES.map((b) => {
      const isUnlocked = profile.unlockedBadges.includes(b.id);
      return {
        ...b,
        unlockedAt: isUnlocked ? b.unlockedAt || new Date().toISOString() : undefined,
        progress: isUnlocked ? 100 : b.progress,
      };
    });
  }

  public unlockBadge(badgeId: string): UserProfile {
    const profile = this.getProfile();
    if (!profile.unlockedBadges.includes(badgeId)) {
      profile.unlockedBadges.push(badgeId);
      profile.xp += 50; // Bonus XP for unlocking badge!
      this.saveProfile(profile);
    }
    return profile;
  }

  public getAssessments(): SpeakingAssessmentReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading assessments:', e);
    }
    return [];
  }

  public saveAssessment(assessment: SpeakingAssessmentReport): void {
    const all = this.getAssessments();
    all.unshift(assessment);
    try {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(all.slice(0, 20)));
    } catch (e) {
      console.warn('Error saving assessment:', e);
    }
  }

  public getCustomVocab(): VocabularyWord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_VOCAB);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading custom vocab:', e);
    }
    return [];
  }

  public saveCustomVocab(words: VocabularyWord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_VOCAB, JSON.stringify(words));
    } catch (e) {
      console.warn('Error saving custom vocab:', e);
    }
  }

  public resetAllData(): void {
    localStorage.clear();
  }
}

export const storageService = new StorageService();
