import { AppState, DailyLog, SacramentsLog, UserStats, DonationRequest, AppNotification } from '../types';

export const TODAY_ISO = new Date().toISOString().split('T')[0];

const USERS_KEY = 'ruhi_users_registry';
const DATA_PREFIX = 'ruhi_data_';
const SHARED_ADMIN_DATA_KEY = 'ruhi_admin_shared_data'; // Simulating backend DB
const INBOX_PREFIX = 'ruhi_inbox_'; // New key for user messages

const INITIAL_STATE: AppState = {
  profile: {
    displayName: "",
    email: "",
    phone: "",
    church: "",
    joinDate: TODAY_ISO
  },
  logs: {},
  sacraments: {
    confession: {
      pin: null,
      currentNote: "",
      history: [],
      lastConfession: null
    },
    lastCommunion: null,
    liturgyAttendance: [],
  },
  stats: {
    currentStreak: 0,
    longestStreak: 0,
    totalFastingDays: 0,
    spiritualPoints: 0,
    bibleProgress: {
      currentBookIndex: 0,
      currentChapter: 1,
      lastReadVerse: 0,
      totalChaptersRead: 0
    }
  },
  dailyMessage: null,
  hazezezHistory: [],
  feelingsHistory: [],
  adsRemoved: false,
  donationRequests: [],
  supportMessages: [],
  notifications: [],
};

// --- Auth Helpers ---

export const registerUser = (username: string): { success: boolean, message: string } => {
  try {
    const registry = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    
    // In simplified mode, if user exists, we just treat it as logging back in.
    if (registry[username]) {
      return { success: true, message: "تم تسجيل الدخول" };
    }
    
    // Register new user
    registry[username] = { joinDate: new Date().toISOString() }; 
    localStorage.setItem(USERS_KEY, JSON.stringify(registry));
    
    // Welcome Notification
    sendNotification(username, {
      id: Date.now().toString(),
      type: 'system',
      title: 'أهلاً بك في خلوتي',
      message: 'نتمنى لك رحلة روحية مباركة. ابدأ يومك بالصلاة وقراءة الإنجيل.',
      date: new Date().toISOString(),
      read: false
    });

    return { success: true, message: "تم إنشاء الحساب بنجاح" };
  } catch (e) {
    return { success: false, message: "حدث خطأ أثناء التسجيل" };
  }
};

export const loginUser = (username: string): { success: boolean, message: string } => {
  try {
    const registry = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    // If not in registry, add them (auto-register on login for simple flow)
    if (!registry[username]) {
       registry[username] = { joinDate: new Date().toISOString() };
       localStorage.setItem(USERS_KEY, JSON.stringify(registry));
    }
    
    return { success: true, message: "تم الدخول بنجاح" };
  } catch (e) {
    return { success: false, message: "حدث خطأ أثناء الدخول" };
  }
};

export const verifyPassword = (username: string, password: string): boolean => {
    // Deprecated
    return true;
};

export const getAllUsers = (): string[] => {
  try {
    const registry = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    return Object.keys(registry);
  } catch (e) {
    return [];
  }
};

// --- Messaging Helpers ---

export const sendNotification = (username: string, notification: AppNotification) => {
  try {
    const key = `${INBOX_PREFIX}${username}`;
    const inbox = JSON.parse(localStorage.getItem(key) || '[]');
    inbox.push(notification);
    localStorage.setItem(key, JSON.stringify(inbox));
  } catch (e) {
    console.error("Failed to send notification", e);
  }
};

export const sendSupportMessage = (username: string, message: string) => {
  try {
    const sharedData = JSON.parse(localStorage.getItem(SHARED_ADMIN_DATA_KEY) || '{"requests": [], "support": []}');
    if (!sharedData.support) sharedData.support = [];
    
    sharedData.support.push({
      id: Date.now().toString(),
      username,
      message,
      date: new Date().toISOString(),
      read: false
    });
    
    localStorage.setItem(SHARED_ADMIN_DATA_KEY, JSON.stringify(sharedData));
  } catch (e) { console.error(e); }
};

// --- State Helpers ---

export const loadState = (username?: string | null): AppState => {
  if (!username) return INITIAL_STATE;
  
  try {
    const serialized = localStorage.getItem(`${DATA_PREFIX}${username}`);
    
    // Get Join Date from Registry if possible
    const registry = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    const userRecord = registry[username];
    const actualJoinDate = (typeof userRecord === 'object' && userRecord.joinDate) 
        ? userRecord.joinDate 
        : new Date().toISOString(); // Default for legacy users

    const sharedData = JSON.parse(localStorage.getItem(SHARED_ADMIN_DATA_KEY) || '{"requests": [], "support": []}');
    
    // 1. Check Donation Status
    const allRequests = sharedData.requests as DonationRequest[];
    const userRequest = allRequests
      .filter(r => r.username === username)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const isAdsRemovedByAdmin = userRequest?.status === 'approved';

    const allSupportMessages = sharedData.support || [];

    // 3. Check Inbox for New Messages
    const inboxKey = `${INBOX_PREFIX}${username}`;
    const newMessages = JSON.parse(localStorage.getItem(inboxKey) || '[]');
    
    if (newMessages.length > 0) {
      localStorage.setItem(inboxKey, '[]'); 
    }

    if (!serialized) {
      // New State but preserve join date
      return { 
        ...INITIAL_STATE, 
        profile: { ...INITIAL_STATE.profile, displayName: username, joinDate: actualJoinDate },
        adsRemoved: isAdsRemovedByAdmin,
        lastDonationStatus: userRequest ? { status: userRequest.status, note: userRequest.adminNote } : undefined,
        notifications: newMessages,
        supportMessages: allSupportMessages
      };
    }
    
    const parsed = JSON.parse(serialized);
    
    // Init arrays and profile if missing (Migration)
    if (!parsed.hazezezHistory) parsed.hazezezHistory = [];
    if (!parsed.feelingsHistory) parsed.feelingsHistory = [];
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.profile) {
        parsed.profile = { 
            displayName: username, 
            email: "", 
            phone: "", 
            church: "",
            joinDate: actualJoinDate 
        };
    } else {
        // Ensure Join Date is synced with registry if local is missing
        if(!parsed.profile.joinDate) parsed.profile.joinDate = actualJoinDate;
    }

    if (parsed.sacraments.confession.notes && !parsed.sacraments.confession.currentNote) {
       parsed.sacraments.confession.currentNote = parsed.sacraments.confession.notes;
    }

    const mergedNotifications = [...newMessages, ...parsed.notifications];

    return {
      ...INITIAL_STATE,
      ...parsed,
      adsRemoved: isAdsRemovedByAdmin,
      stats: { 
        ...INITIAL_STATE.stats, 
        ...parsed.stats, 
        bibleProgress: { ...INITIAL_STATE.stats.bibleProgress, ...parsed.stats.bibleProgress }
      },
      sacraments: { 
        ...INITIAL_STATE.sacraments, 
        ...parsed.sacraments,
        confession: { ...INITIAL_STATE.sacraments.confession, ...parsed.sacraments.confession }
      },
      lastDonationStatus: userRequest ? { status: userRequest.status, note: userRequest.adminNote } : undefined,
      notifications: mergedNotifications,
      supportMessages: allSupportMessages
    };
  } catch (e) {
    console.error("Failed to load state", e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState, username: string) => {
  if (!username) return;
  try {
    const { donationRequests, lastDonationStatus, supportMessages, ...personalData } = state;
    localStorage.setItem(`${DATA_PREFIX}${username}`, JSON.stringify(personalData));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const submitDonationRequest = (request: any) => {
  try {
    const currentShared = JSON.parse(localStorage.getItem(SHARED_ADMIN_DATA_KEY) || '{"requests": []}');
    currentShared.requests.push(request);
    localStorage.setItem(SHARED_ADMIN_DATA_KEY, JSON.stringify(currentShared));
  } catch(e) { console.error(e); }
};

export const getEmptyLog = (date: string): DailyLog => ({
  date,
  fastingType: {
    wednesday: false,
    friday: false,
    greatLent: false,
    nativityFast: false,
    jonahFast: false,
    apostlesFast: false,
    virginMaryFast: false
  },
  prayers: {
    matins: false,
    terce: false,
    sext: false,
    none: false,
    vespers: false,
    compline: false,
    midnight: false
  },
  agpeyaPrayed: false,
  bibleReadingDone: false,
  dailyVerseRead: false,
  dailyAbayaRead: false,
  jesusPrayerCount: 0,
  touchedMe: "",
  dailyVerseIndex: Math.floor(Math.random() * 30),
  dailyAbayaIndex: Math.floor(Math.random() * 10)
});

export const calculateStreak = (logs: Record<string, DailyLog>): number => {
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs[dateStr];
    
    if (log && (
        Object.values(log.fastingType).some(v => v) || 
        log.bibleReadingDone || 
        log.dailyVerseRead ||
        Object.values(log.prayers).some(v => v) ||
        log.jesusPrayerCount > 0
    )) {
      streak++;
    } else if (i === 0) {
      continue; 
    } else {
      break;
    }
  }
  return streak;
};

export const formatDateArabic = (dateStr: string) => {
  if (!dateStr) return 'غير محدد';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(d);
};

export const getCopticDate = (): string => {
  const today = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('ar-EG-u-ca-coptic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(today).replace(/ERA1|م/g, "").trim(); 
  } catch (e) {
    return `${today.getDate()} (قبطي)`;
  }
};