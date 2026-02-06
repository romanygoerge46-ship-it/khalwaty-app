import React, { useEffect, useState } from 'react';
import { AppState, DailyLog, BibleProgress, FeelingEntry } from '../types';
import { NEW_TESTAMENT_BOOKS, DAILY_VERSES, PATRISTIC_QUOTES } from '../lib/data';
import { 
  Flame, BookOpen, Sun, Moon, Star, Calendar, 
  Smile, Plus, Minus, TrendingUp, CheckCircle, Clock, Lightbulb, CheckSquare, Square, X, Info, Copy, Quote, Heart
} from 'lucide-react';
import { getDailySpiritualMessage } from '../lib/gemini';
import { TODAY_ISO, calculateStreak } from '../lib/utils';
// import PrayerReader from './PrayerReader'; // Removed to simplify per user request
import FeelingsModal from './FeelingsModal';
import FastingManager from './FastingManager';

interface Props {
  state: AppState;
  onUpdateLog: (date: string, updates: Partial<DailyLog>) => void;
  onUpdateBible: (updates: Partial<BibleProgress>) => void;
  onUpdateMessage: (msg: string) => void;
  onAddPoints: (pts: number) => void;
  onAddFeeling: (entry: FeelingEntry) => void;
  onEncourage: () => void;
}

// Helper for Crown History
const CrownHistoryModal = ({ logs, streak, onClose }: { logs: Record<string, DailyLog>, streak: number, onClose: () => void }) => {
    // Generate last 30 days
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                    <X className="w-5 h-5 text-slate-600" />
                </button>
                
                <div className="text-center mb-6 mt-2">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-amber-200">
                        <Flame className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">إكليل الشهر</h3>
                    <p className="text-slate-500 text-sm">استمرارية: <span className="font-bold text-amber-600">{streak} يوم</span></p>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(d => (
                        <div key={d} className="text-center text-xs font-bold text-slate-400">{d}</div>
                    ))}
                    {days.reverse().map((d, i) => {
                        const dateStr = d.toISOString().split('T')[0];
                        const log = logs[dateStr];
                        // Logic for "Crown Achieved" on that day: Matins + Compline + Bible
                        const achieved = log && log.prayers?.matins && log.prayers?.compline && log.bibleReadingDone;
                        const isFuture = d > new Date(); // Shouldn't happen with reverse loop of past days but safety check
                        
                        return (
                            <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold border ${
                                achieved 
                                ? 'bg-amber-400 text-white border-amber-500 shadow-sm' 
                                : 'bg-slate-50 text-slate-300 border-slate-100'
                            }`}>
                                {d.getDate()}
                            </div>
                        )
                    })}
                </div>
                
                <p className="text-[10px] text-center text-slate-400">
                    يضيء اليوم عند إتمام: باكر + النوم + الإنجيل
                </p>
            </div>
        </div>
    )
}

export default function HomeTab({ state, onUpdateLog, onUpdateBible, onUpdateMessage, onAddPoints, onAddFeeling, onEncourage }: Props) {
  const log = state.logs[TODAY_ISO] || { 
    date: TODAY_ISO, 
    fastingType: {},
    prayers: { matins: false, terce: false, sext: false, none: false, vespers: false, compline: false, midnight: false },
    bibleReadingDone: false, dailyVerseRead: false, dailyAbayaRead: false, jesusPrayerCount: 0, touchedMe: "", dailyVerseIndex: Math.floor(Math.random() * 30), dailyAbayaIndex: Math.floor(Math.random() * 10)
  } as DailyLog;

  const [showFeelings, setShowFeelings] = useState(false);
  const [fastingAlert, setFastingAlert] = useState<string | null>(null);
  const [showCrownHistory, setShowCrownHistory] = useState(false);

  // Check if feeling selected today
  const todaysFeeling = state.feelingsHistory.find(f => f.date.startsWith(TODAY_ISO));

  // Daily Feelings Popup Logic
  useEffect(() => {
    const lastSeen = sessionStorage.getItem('ruhi_seen_feelings');
    if (lastSeen !== TODAY_ISO) {
      setTimeout(() => setShowFeelings(true), 1500);
      sessionStorage.setItem('ruhi_seen_feelings', TODAY_ISO);
    }
  }, []);

  // Fasting/Liturgy Alert Logic
  useEffect(() => {
    const d = new Date();
    const hour = d.getHours();
    const day = d.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    
    // Friday Alert: Reminder for Friday Liturgy (Thursday night or Friday morning)
    if (day === 4 && hour >= 18) { // Thursday Night
      setFastingAlert(`تذكير: استعد لقداس غداً الجمعة. جهز قلبك.`);
    } 
    else if (day === 5) { // Friday
       setFastingAlert(`يوم الجمعة: تذكر حضور القداس اليوم إذا أمكن.`);
    } else {
       setFastingAlert(null);
    }
  }, []);

  const currentBook = NEW_TESTAMENT_BOOKS[state.stats.bibleProgress.currentBookIndex];
  const dailyVerse = DAILY_VERSES[log.dailyVerseIndex % DAILY_VERSES.length];
  const dailyAbaya = PATRISTIC_QUOTES[log.dailyAbayaIndex % PATRISTIC_QUOTES.length];

  const isWreathLit = (log.prayers.matins && log.prayers.compline && log.bibleReadingDone);

  const togglePrayer = (id: string) => {
    const currentStatus = log.prayers?.[id as keyof typeof log.prayers];
    const newStatus = !currentStatus;
    
    onUpdateLog(TODAY_ISO, {
      prayers: { ...log.prayers, [id]: newStatus }
    });

    if (newStatus) {
      onAddPoints(10);
      onEncourage();
    }
  };

  const markVerseRead = () => {
    if (!log.dailyVerseRead) {
      onUpdateLog(TODAY_ISO, { dailyVerseRead: true });
      onAddPoints(5);
    }
  };

  const markAbayaRead = () => {
    if (!log.dailyAbayaRead) {
      onUpdateLog(TODAY_ISO, { dailyAbayaRead: true });
      onAddPoints(5);
    }
  };

  const copyText = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("تم النسخ بنجاح");
  };

  // Bible Chunk Logic
  const handleReadBibleChunk = () => {
    const currentVerse = state.stats.bibleProgress.lastReadVerse || 0;
    const chunksize = 5;
    let newVerse = currentVerse + chunksize;
    let newChapter = state.stats.bibleProgress.currentChapter;
    let newBookIndex = state.stats.bibleProgress.currentBookIndex;
    let newTotalRead = state.stats.bibleProgress.totalChaptersRead;

    const MOCK_VERSES_PER_CHAPTER = 20;

    if (newVerse >= MOCK_VERSES_PER_CHAPTER) {
       newVerse = 0;
       newChapter++;
       newTotalRead++; 
       if (newChapter > currentBook.chapters) {
          newChapter = 1;
          newBookIndex++;
          if (newBookIndex >= NEW_TESTAMENT_BOOKS.length) newBookIndex = 0; 
       }
    }

    onUpdateBible({
      lastReadVerse: newVerse,
      currentChapter: newChapter,
      currentBookIndex: newBookIndex,
      totalChaptersRead: newTotalRead
    });

    if (!log.bibleReadingDone) {
        onUpdateLog(TODAY_ISO, { bibleReadingDone: true });
        onAddPoints(20);
        onEncourage();
    }
  };

  const prayersList = [
    { id: 'matins', label: 'باكر', icon: Sun, mandatory: true },
    { id: 'terce', label: 'الثالثة', icon: Sun },
    { id: 'sext', label: 'السادسة', icon: Sun },
    { id: 'none', label: 'التاسعة', icon: Sun },
    { id: 'vespers', label: 'الغروب', icon: Moon },
    { id: 'compline', label: 'النوم', icon: Moon, mandatory: true },
    { id: 'midnight', label: 'نصف الليل', icon: Star },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      
      {/* 1. Dashboard Banner / Header (Responsive) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 rounded-3xl shadow-xl shadow-blue-200/50 text-white relative overflow-hidden mb-8">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 opacity-20 rounded-full -ml-10 -mb-10 blur-3xl"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
           
           <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                {/* Left: Wreath (Daily Crown) */}
                <div className="flex flex-col items-center cursor-pointer group" onClick={() => setShowCrownHistory(true)}>
                    <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center relative transition-all duration-700 ${isWreathLit ? 'border-amber-300 bg-amber-400/20 shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 'border-white/20 bg-white/10 group-hover:bg-white/20'}`}>
                        <Flame className={`w-8 h-8 ${isWreathLit ? 'text-amber-300 fill-amber-300 animate-pulse' : 'text-blue-100'}`} />
                    </div>
                    {/* Crown Day Label */}
                    <span className="text-[10px] text-blue-100 mt-2 font-bold px-3 py-1 bg-black/10 rounded-full border border-white/5">
                        يوم {state.stats.currentStreak + (isWreathLit ? 0 : 1)}
                    </span>
                </div>

                {/* Right: Spiritual Points */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                        <span className="text-5xl font-bold font-mono tracking-tighter drop-shadow-sm">{state.stats.spiritualPoints}</span>
                    </div>
                    <span className="text-xs text-blue-100 font-medium opacity-80">نقطة روحية</span>
                </div>
           </div>

           {/* Stats Row (Desktop: Horizontal, Mobile: Stacked below) */}
           <div className="flex justify-between md:justify-end gap-4 md:gap-8 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20 shadow-inner w-full md:w-auto">
                <div className="text-center px-2">
                    <p className="text-[10px] text-blue-100 mb-1 opacity-70 font-bold">الاستمرارية</p>
                    <p className="font-bold text-lg flex items-center justify-center gap-1">
                        {state.stats.currentStreak} <TrendingUp className="w-3 h-3" />
                    </p>
                </div>
                <div className="w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                <div className="text-center px-2">
                    <p className="text-[10px] text-blue-100 mb-1 opacity-70 font-bold">صيام</p>
                    <p className="font-bold text-lg">{state.stats.totalFastingDays}</p>
                </div>
                <div className="w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                <div className="text-center px-2">
                    <p className="text-[10px] text-blue-100 mb-1 opacity-70 font-bold">قداسات</p>
                    <p className="font-bold text-lg">{state.sacraments.liturgyAttendance.length}</p>
                </div>
           </div>

         </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Column 1: Daily Readings */}
        <div className="space-y-6">
            
            {/* Feelings Reminder */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                {todaysFeeling ? (
                    <div className="flex items-center gap-3">
                        <div className="text-3xl bg-blue-50 w-12 h-12 flex items-center justify-center rounded-full">
                            {state.feelingsHistory.find(f => f.emotionId === todaysFeeling.emotionId)?.emotionId === 'happy' ? '😊' : '🙏'} 
                        </div>
                        <div>
                        <p className="text-xs text-slate-400 font-bold">مشاعرك اليوم</p>
                        <p className="text-slate-800 font-bold">{todaysFeeling.emotionLabel}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 w-12 h-12 flex items-center justify-center rounded-full">
                            <Smile className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                        <p className="text-xs text-slate-400 font-bold">لم تختر بعد</p>
                        <p className="text-slate-800 font-bold">كيف تشعر اليوم؟</p>
                        </div>
                    </div>
                )}
                <button 
                    onClick={() => setShowFeelings(true)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                >
                    {todaysFeeling ? 'تغيير' : 'اختيار'}
                </button>
            </div>

            {/* Daily Verse */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:border-amber-200 transition-all duration-300 h-fit">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-amber-900 text-sm">آية اليوم</h3>
                </div>
                
                <div className="p-8 text-center">
                    <p className="text-xl font-bold text-slate-800 leading-loose font-serif">"{dailyVerse.text}"</p>
                    <p className="text-sm text-amber-600 mt-4 font-bold tracking-wide">{dailyVerse.ref}</p>
                </div>

                <div className="bg-slate-50 p-3 flex items-center justify-between border-t border-slate-100">
                    <button 
                        onClick={() => copyText(`"${dailyVerse.text}" (${dailyVerse.ref})`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-white hover:text-amber-600 hover:shadow-sm transition-all text-xs font-bold"
                    >
                        <Copy className="w-4 h-4" /> نسخ
                    </button>
                    
                    <button 
                        onClick={markVerseRead}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            log.dailyVerseRead 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'
                        }`}
                    >
                        {log.dailyVerseRead ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                        {log.dailyVerseRead ? "تم" : "قراءة"}
                    </button>
                </div>
            </div>

            {/* Abayeyat */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:border-blue-200 transition-all duration-300 h-fit">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center gap-2">
                    <Quote className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-blue-900 text-sm">أقوال الآباء</h3>
                </div>

                <div className="p-6 text-center">
                    <p className="text-lg text-slate-700 font-medium leading-relaxed mb-4">"{dailyAbaya.text}"</p>
                    <p className="text-sm text-blue-600 font-bold mb-6">- {dailyAbaya.author}</p>
                    
                    {dailyAbaya.explanation && (
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 inline-block w-full">
                            <div className="flex items-center gap-2 mb-2 justify-center opacity-80">
                                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-bold text-slate-600">كلام مبسط</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed text-center">{dailyAbaya.explanation}</p>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 p-3 flex items-center justify-between border-t border-slate-100">
                    <button 
                        onClick={() => copyText(`"${dailyAbaya.text}" - ${dailyAbaya.author}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all text-xs font-bold"
                    >
                        <Copy className="w-4 h-4" /> نسخ
                    </button>
                    
                    <button 
                        onClick={markAbayaRead}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            log.dailyAbayaRead 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                    >
                        {log.dailyAbayaRead ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                        {log.dailyAbayaRead ? "تم" : "قراءة"}
                    </button>
                </div>
            </div>
        </div>

        {/* Column 2: Prayers & Fasting */}
        <div className="space-y-6">
            
            {/* Fasting/Liturgy Alert */}
            {fastingAlert && (
                <div className="bg-purple-50 border border-purple-100 text-purple-900 p-4 rounded-2xl flex items-center gap-3 shadow-sm animate-in zoom-in-95">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-bold">{fastingAlert}</p>
                </div>
            )}

            {/* Jesus Prayer */}
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Heart className="w-4 h-4 text-blue-500" /></div>
                    صلاة يسوع
                </h3>
                
                <div className="relative py-4 px-2 mb-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-lg font-serif text-blue-900 font-bold leading-relaxed">
                        "يا ربي يسوع المسيح، ارحمني أنا الخاطئ"
                    </p>
                </div>

                <div className="flex items-center justify-center gap-8 mb-6">
                    <button 
                    onClick={() => log.jesusPrayerCount > 0 && onUpdateLog(TODAY_ISO, { jesusPrayerCount: log.jesusPrayerCount - 1 })}
                    className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                    <Minus className="w-6 h-6" />
                    </button>
                    
                    <div className="flex flex-col items-center w-16">
                    <span className="text-4xl font-bold text-blue-600">{log.jesusPrayerCount}</span>
                    </div>

                    <button
                    onClick={() => {
                        onUpdateLog(TODAY_ISO, { jesusPrayerCount: log.jesusPrayerCount + 1 });
                        onAddPoints(1);
                        if (log.jesusPrayerCount === 2) onEncourage(); // Encourage on reaching 3
                    }}
                    className="w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 flex items-center justify-center active:scale-95 transition-transform"
                    >
                    <Plus className="w-7 h-7" />
                    </button>
                </div>
                
                <div className="flex justify-center gap-1.5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < log.jesusPrayerCount ? 'bg-blue-500 w-8' : 'bg-slate-200 w-2'}`} />
                    ))}
                </div>
            </div>

            {/* Fasting Manager */}
            <FastingManager 
                logs={state.logs}
                onUpdateLog={onUpdateLog}
                onAddPoints={onAddPoints}
                onEncourage={onEncourage}
            />

        </div>

        {/* Column 3: Agpeya & Bible */}
        <div className="space-y-6">
            
            {/* Agpeya Prayers */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><BookOpen className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-slate-800">الأجبية المقدسة</h3>
                        <p className="text-[10px] text-slate-400 font-bold">صلوات السواعي</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                    {prayersList.map(p => {
                    const isDone = log.prayers?.[p.id as keyof typeof log.prayers];
                    const Icon = p.icon;
                    const isMandatory = p.mandatory;

                    return (
                        <button 
                        key={p.id}
                        onClick={() => togglePrayer(p.id)}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${
                            isDone 
                            ? 'bg-green-500 text-white border-green-600 shadow-md shadow-green-200' 
                            : isMandatory
                                ? 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-300' 
                                : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                        >
                        <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isDone ? 'text-white' : isMandatory ? 'text-indigo-500' : 'text-slate-400'}`} />
                            <span className={`text-sm font-bold ${isDone ? 'text-white' : 'text-slate-700'}`}>
                            {p.label}
                            </span>
                        </div>
                        {isDone ? <CheckSquare className="w-5 h-5 text-white" /> : <div className={`w-5 h-5 border-2 rounded-md ${isMandatory ? 'border-indigo-200' : 'border-slate-200'}`} />}
                        </button>
                    )
                    })}
                </div>
            </div>

            {/* Bible */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    إنجيلي اليومي
                    </h3>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
                    {currentBook.name} {state.stats.bibleProgress.currentChapter}
                    </span>
                </div>

                <div className="bg-[#fffcf5] p-6 rounded-2xl border border-stone-100 mb-6 font-serif text-slate-800 leading-loose text-justify text-sm shadow-inner relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-stone-200 to-transparent opacity-50"></div>
                    <p className="opacity-80">
                    (آيات {state.stats.bibleProgress.lastReadVerse + 1} - {state.stats.bibleProgress.lastReadVerse + 5})
                    <br/>
                    في البدء كان الكلمة، والكلمة كان عند الله، وكان الكلمة الله. هذا كان في البدء عند الله. كل شيء به كان، وبغيره لم يكن شيء مما كان...
                    </p>
                </div>

                <button
                    onClick={handleReadBibleChunk}
                    disabled={log.bibleReadingDone}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    log.bibleReadingDone
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                    }`}
                >
                    {log.bibleReadingDone ? "تمت قراءة الورد اليومي ✅" : "إتمام القراءة (+20)"}
                </button>
            </div>

        </div>

      </div>

      {/* Modals */}
      {showCrownHistory && (
          <CrownHistoryModal 
            logs={state.logs} 
            streak={state.stats.currentStreak} 
            onClose={() => setShowCrownHistory(false)} 
          />
      )}

      {showFeelings && (
        <FeelingsModal 
          onClose={() => setShowFeelings(false)} 
          onSaveFeeling={(entry) => {
             onAddFeeling(entry);
             onEncourage();
          }}
          history={state.feelingsHistory || []}
        />
      )}
    </div>
  );
}