
export interface BibleProgress {
  currentBookIndex: number; // 0 for Matthew
  currentChapter: number; // 1-based
  lastReadVerse: number; // For chunk-based reading (starts at 0)
  totalChaptersRead: number;
}

export interface ArchivedConfession {
  id: string;
  date: string;
  text: string;
}

export interface ConfessionData {
  pin: string | null;
  currentNote: string;
  lastConfession: string | null;
  history: ArchivedConfession[];
}

export interface HazezezEntry {
  id: string;
  date: string;
  text: string;
}

export interface FeelingEntry {
  id: string;
  date: string; // ISO String
  emotionId: string;
  emotionLabel: string;
  verseText: string;
  verseRef: string;
}

export interface DailyLog {
  date: string;
  // Fasting details
  fastingType: {
    wednesday: boolean;
    friday: boolean;
    greatLent: boolean;
    nativityFast: boolean;
    jonahFast: boolean;
    apostlesFast: boolean;
    virginMaryFast: boolean;
  };
  // Prayer details - Expanded for 7 Prayers
  prayers: {
    matins: boolean;
    terce: boolean;
    sext: boolean;
    none: boolean;
    vespers: boolean;
    compline: boolean;
    midnight: boolean;
  };
  agpeyaPrayed: boolean;
  
  // Bible
  bibleReadingDone: boolean; // For the daily chunk
  
  // New Read Status
  dailyVerseRead: boolean;
  dailyAbayaRead: boolean;
  
  // Spiritual exercises
  jesusPrayerCount: number;
  touchedMe: string; // "Akter haga lamsetne" (Saved for the day)
  dailyVerseIndex: number; // To keep the same verse for the day
  dailyAbayaIndex: number; // For Patristic quotes
}

export interface SacramentsLog {
  confession: ConfessionData;
  lastCommunion: string | null;
  liturgyAttendance: string[];
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalFastingDays: number;
  spiritualPoints: number;
  bibleProgress: BibleProgress;
}

export interface UserProfile {
  displayName: string;
  email: string;
  phone: string;
  church: string;
  joinDate: string;
}

export enum AppTab {
  HOME = 'يومي',
  MEDITATIONS = 'تأملات',
  SACRAMENTS = 'الأسرار',
  PROFILE = 'حسابي', 
}

export interface DailyMessage {
  content: string;
  date: string;
  isLoading?: boolean;
}

export interface DonationRequest {
  id: string;
  username: string;
  amount: string;
  transactionRef: string;
  method: string; // 'instapay' | 'wallet'
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
}

export interface SupportMessage {
  id: string;
  username: string;
  message: string;
  date: string;
  read: boolean;
  reply?: string;
}

export interface AppNotification {
  id: string;
  type: 'admin' | 'system' | 'friend';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface AppState {
  profile: UserProfile; 
  logs: Record<string, DailyLog>;
  sacraments: SacramentsLog;
  stats: UserStats;
  dailyMessage: DailyMessage | null;
  hazezezHistory: HazezezEntry[];
  meditationsPin: string | null; // New PIN for Meditations
  feelingsHistory: FeelingEntry[];
  adsRemoved: boolean;
  donationRequests: DonationRequest[]; 
  supportMessages: SupportMessage[]; 
  lastDonationStatus?: {
    status: 'pending' | 'approved' | 'rejected';
    note?: string;
  };
  notifications: AppNotification[];
}