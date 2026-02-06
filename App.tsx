
import React, { useState, useEffect } from 'react';
import { 
  AppTab, AppState, DailyLog, SacramentsLog, BibleProgress, HazezezEntry, FeelingEntry, UserProfile 
} from './types';
import { 
  loadState, saveState, getEmptyLog, TODAY_ISO, calculateStreak, getCopticDate, submitDonationRequest 
} from './lib/utils';
import HomeTab from './components/HomeTab';
import SacramentsTab from './components/SacramentsTab';
import MeditationsTab from './components/MeditationsTab';
import ProfileTab from './components/ProfileTab'; 
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard';
import NotificationsModal from './components/NotificationsModal';
import SupportModal from './components/SupportModal';
import { 
  Home, ScrollText, Cloud, Heart, X, Copy, CheckCircle, 
  Loader2, LogOut, ShieldCheck, AlertCircle, Bell, MessageCircle, User, Globe, Smartphone, CreditCard
} from 'lucide-react';

const HolyBibleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 drop-shadow-sm">
    <path d="M12 4V20M12 4H6.2C5.0799 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.0799 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.0799 20 6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 8H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 7V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [state, setState] = useState<AppState>(loadState(null));
  
  const [showDonation, setShowDonation] = useState(false);
  const [donationMethod, setDonationMethod] = useState<'instapay' | 'wallet'>('instapay');
  const [donationAmount, setDonationAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false); 

  useEffect(() => {
    const savedUser = localStorage.getItem('ruhi_last_user');
    if (savedUser) {
      handleLoginSuccess(savedUser);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
       const timer = setInterval(() => {
          const updatedState = loadState(currentUser);
          const currentPending = state.donationRequests.length;
          const newPending = updatedState.donationRequests.length;
          const currentMsgs = state.notifications.length;
          const newMsgs = updatedState.notifications.length;
          
          if (updatedState.adsRemoved !== state.adsRemoved || 
              updatedState.lastDonationStatus?.status !== state.lastDonationStatus?.status ||
              currentPending !== newPending ||
              currentMsgs !== newMsgs) {
              setState(updatedState);
          }
       }, 3000);
       return () => clearInterval(timer);
    }
  }, [currentUser, state.notifications.length, state.adsRemoved]);

  useEffect(() => {
    if (currentUser) {
      saveState(state, currentUser);
    }
  }, [state, currentUser]);

  const handleLoginSuccess = (username: string) => {
    const userState = loadState(username);
    setState(userState);
    setCurrentUser(username);
    localStorage.setItem('ruhi_last_user', username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ruhi_last_user');
    setState(loadState(null));
    setShowAdminDashboard(false);
    setActiveTab(AppTab.HOME);
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 1000);
  };

  const handleUpdateLog = (date: string, updates: Partial<DailyLog>) => {
    setState((prev: AppState) => {
      const currentLog = prev.logs[date] || getEmptyLog(date);
      const newLog = { ...currentLog, ...updates }; // Simplified update
      if (updates.fastingType) newLog.fastingType = { ...currentLog.fastingType, ...updates.fastingType };
      if (updates.prayers) newLog.prayers = { ...currentLog.prayers, ...updates.prayers };

      const newLogs = { ...prev.logs, [date]: newLog };
      const newStreak = calculateStreak(newLogs);
      const totalFastingDays = Object.values(newLogs).filter(l => Object.values(l.fastingType).some(v => v)).length;
      
      return {
        ...prev,
        logs: newLogs,
        stats: { ...prev.stats, currentStreak: newStreak, longestStreak: Math.max(prev.stats.longestStreak, newStreak), totalFastingDays }
      };
    });
  };

  // State Update Wrappers
  const handleUpdateSacraments = (updates: Partial<SacramentsLog>) => setState(prev => ({ ...prev, sacraments: { ...prev.sacraments, ...updates } }));
  const handleUpdateBible = (updates: Partial<BibleProgress>) => setState(prev => ({ ...prev, stats: { ...prev.stats, bibleProgress: { ...prev.stats.bibleProgress, ...updates } } }));
  const handleAddPoints = (pts: number) => setState(prev => ({ ...prev, stats: { ...prev.stats, spiritualPoints: prev.stats.spiritualPoints + pts } }));
  const handleUpdateMessage = (content: string) => setState(prev => ({ ...prev, dailyMessage: { content, date: TODAY_ISO } }));
  const handleAddHazezez = (entry: HazezezEntry) => setState(prev => ({ ...prev, hazezezHistory: [...(prev.hazezezHistory || []), entry] }));
  const handleUpdateHazezez = (entries: HazezezEntry[]) => setState(prev => ({ ...prev, hazezezHistory: entries }));
  const handleAddFeeling = (entry: FeelingEntry) => setState(prev => ({ ...prev, feelingsHistory: [...(prev.feelingsHistory || []), entry] }));

  const handleMarkRead = (id: string) => setState(prev => ({ ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
  
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
      setState(prev => ({ ...prev, profile: { ...prev.profile, ...updates } }));
      showToast("تم تحديث البيانات بنجاح ✅");
  };

  const handleResetConfessionPin = () => {
      setState(prev => ({ ...prev, sacraments: { ...prev.sacraments, confession: { ...prev.sacraments.confession, pin: null } } }));
      showToast("تم إعادة تعيين الرمز السري");
  };

  const handleUpdateMeditationsPin = (newPin: string | null) => {
      setState(prev => ({ ...prev, meditationsPin: newPin }));
      showToast("تم تحديث رمز التأملات");
  };

  const handleClearData = () => {
      if (currentUser) {
          localStorage.removeItem(`ruhi_data_${currentUser}`);
          handleLogout();
      }
  };

  const handleConfirmPayment = () => {
    if (!transactionRef.trim() || !donationAmount) {
      alert("من فضلك أدخل المبلغ ورقم العملية");
      return;
    }

    submitDonationRequest({
      id: Date.now().toString(),
      username: currentUser || 'Unknown',
      amount: donationAmount,
      transactionRef: transactionRef,
      method: donationMethod,
      date: new Date().toISOString(),
      status: 'pending'
    });

    setState(prev => ({ ...prev, lastDonationStatus: { status: 'pending' } }));
    setShowDonation(false);
    showToast("تم إرسال التبرع للمراجعة. شكراً لك! ❤️");
  };

  const renderContent = () => {
    if (showAdminDashboard) {
      return <AdminDashboard onBack={() => setShowAdminDashboard(false)} />;
    }
    switch (activeTab) {
      case AppTab.HOME: return <HomeTab state={state} onUpdateLog={handleUpdateLog} onUpdateBible={handleUpdateBible} onUpdateMessage={handleUpdateMessage} onAddPoints={handleAddPoints} onAddFeeling={handleAddFeeling} onEncourage={() => showToast("شاطر! استمر يا بطل! 🌟")} />;
      case AppTab.MEDITATIONS: return <MeditationsTab state={state} onAddHazezez={handleAddHazezez} onUpdateHazezez={handleUpdateHazezez} />;
      case AppTab.SACRAMENTS: return <SacramentsTab state={state} onUpdateSacraments={handleUpdateSacraments} />;
      case AppTab.PROFILE: return (
        <ProfileTab 
          currentUser={currentUser || ''} 
          state={state}
          onUpdateProfile={handleUpdateProfile} 
          onResetConfessionPin={handleResetConfessionPin}
          onLogout={handleLogout}
          onClearData={handleClearData}
          onOpenDonation={() => setShowDonation(true)}
          onUpdateMeditationsPin={handleUpdateMeditationsPin}
        />
      );
      default: return null;
    }
  };

  if (!currentUser) return <AuthScreen onLoginSuccess={handleLoginSuccess} />;

  const pendingRequestsCount = state.donationRequests.filter(r => r.status === 'pending').length;
  const hasAdminAlerts = pendingRequestsCount > 0; 
  const unreadNotifications = state.notifications.filter(n => !n.read).length;

  const tabs = [
    { id: AppTab.HOME, icon: Home, label: 'يومي' },
    { id: AppTab.MEDITATIONS, icon: Cloud, label: 'تأملات' },
    { id: AppTab.SACRAMENTS, icon: ScrollText, label: 'أسراري' },
    { id: AppTab.PROFILE, icon: User, label: 'حسابي' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-[Cairo] antialiased leading-relaxed tracking-wide selection:bg-blue-100 flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all w-full">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onDoubleClick={() => setShowAdminDashboard(!showAdminDashboard)} className="hover:scale-105 transition-transform">
                 <HolyBibleIcon />
              </button>
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-none tracking-tight">خلوتي</h1>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-1">مرحباً، {state.profile.displayName || currentUser}</span>
              </div>
            </div>

            {!showAdminDashboard && (
                <nav className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold ${
                                activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
             )}

            <div className="flex items-center gap-2">
              <button onClick={() => setShowNotifications(true)} className="p-2 sm:p-2.5 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadNotifications > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
              </button>

              <button onClick={() => setShowSupport(true)} className="p-2 sm:p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                 <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button onClick={() => setShowAdminDashboard(!showAdminDashboard)} className={`p-2 sm:p-2.5 rounded-full transition-colors relative ${showAdminDashboard ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                {hasAdminAlerts && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
              </button>
            </div>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
         <div className="min-h-full">{renderContent()}</div>
      </main>

      {/* Footer */}
      <footer className="hidden md:block py-6 text-center text-slate-400 text-sm border-t border-slate-100 mt-auto bg-white">
          <div className="flex items-center justify-center gap-2 mb-2">
             <Globe className="w-4 h-4" />
             <span className="font-bold">خلوتي - رفيقك الروحي</span>
          </div>
          <p>© {new Date().getFullYear()} جميع الحقوق محفوظة.</p>
      </footer>

      {/* Mobile Bottom Nav */}
      {!showAdminDashboard && (
          <nav className="md:hidden sticky bottom-0 z-40 bg-white border-t border-slate-100 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-around items-center px-2 py-3">
                  {tabs.map(tab => (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 w-16 active:scale-95 ${
                              activeTab === tab.id ? 'text-blue-600 bg-blue-50 scale-105' : 'text-slate-400 hover:text-slate-600'
                          }`}
                      >
                          <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-blue-600/20' : ''}`} />
                          <span className="text-[10px] font-bold">{tab.label}</span>
                      </button>
                  ))}
              </div>
          </nav>
      )}

      {/* Donation Modal (Updated for InstaPay) */}
      {showDonation && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-lg">دعم التطوير</h3>
                 <button onClick={() => setShowDonation(false)}><X className="w-6 h-6 text-slate-400" /></button>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                  <p className="text-sm text-blue-800 leading-relaxed font-bold">
                     تطبيق خلوتي مجاني بالكامل. تبرعك يساعدنا في دفع تكاليف الاستضافة وتطوير ميزات جديدة.
                  </p>
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3 mb-2">
                     <button onClick={() => setDonationMethod('instapay')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${donationMethod === 'instapay' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-100'}`}>
                         <Smartphone className="w-6 h-6" />
                         <span className="text-sm font-bold">InstaPay</span>
                     </button>
                     <button onClick={() => setDonationMethod('wallet')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${donationMethod === 'wallet' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-100'}`}>
                         <CreditCard className="w-6 h-6" />
                         <span className="text-sm font-bold">محفظة</span>
                     </button>
                 </div>

                 <div className="text-center py-2">
                     <p className="text-xs text-slate-500 font-bold mb-1">
                        {donationMethod === 'instapay' ? 'حول على حساب إنستاباي:' : 'حول على محفظة فودافون/إتصالات:'}
                     </p>
                     <p className="text-xl font-black text-slate-800 tracking-wider font-mono bg-slate-100 py-2 rounded-lg select-all">
                        {donationMethod === 'instapay' ? 'username@instapay' : '010XXXXXXXX'}
                     </p>
                 </div>

                 <input 
                    type="number"
                    placeholder="المبلغ (جنيهاً)"
                    value={donationAmount}
                    onChange={e => setDonationAmount(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                 />
                 <input 
                    type="text"
                    placeholder="رقم العملية (للتأكيد)"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                 />
                 <button onClick={handleConfirmPayment} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">
                     تأكيد التبرع
                 </button>
              </div>
           </div>
        </div>
      )}

      {showNotifications && <NotificationsModal notifications={state.notifications} onClose={() => setShowNotifications(false)} onMarkRead={handleMarkRead} />}
      {showSupport && currentUser && <SupportModal username={currentUser} onClose={() => setShowSupport(false)} />}
      
      {toastMessage && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold">{toastMessage}</span>
          </div>
      )}
    </div>
  );
}
