import React from 'react';
import { DailyLog } from '../types';
import { Calendar, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  logs: Record<string, DailyLog>;
  onUpdateLog: (date: string, updates: Partial<DailyLog>) => void;
  onAddPoints: (pts: number) => void;
  onEncourage: () => void;
}

// Fasting Definitions
const FASTS = [
  { id: 'nativityFast', title: "صوم الميلاد", days: 43, start: new Date('2024-11-25'), end: new Date('2025-01-07') },
  { id: 'greatLent', title: "الصوم الكبير", days: 55, start: new Date('2024-03-11'), end: new Date('2024-05-04') }, 
  { id: 'apostlesFast', title: "صوم الرسل", days: 0, start: new Date('2024-06-24'), end: new Date('2024-07-12') },
  { id: 'virginMaryFast', title: "صوم السيدة العذراء", days: 15, start: new Date('2024-08-07'), end: new Date('2024-08-22') },
];

export default function FastingManager({ logs, onUpdateLog, onAddPoints, onEncourage }: Props) {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  
  // Calculate start of current week (let's say we start week on Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek);
  
  // Generate current week dates (Sun to Sat)
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push(d);
  }

  // Helper to get fast info for a date
  const getFastInfo = (date: Date) => {
    // 1. Check major fasts
    for (const fast of FASTS) {
      if (date >= fast.start && date <= fast.end) {
        // Calculate day number (1-based)
        const diffTime = Math.abs(date.getTime() - fast.start.getTime());
        const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        return { 
          isFast: true, 
          label: `اليوم ${dayNumber} من ${fast.title}`,
          id: fast.id
        };
      }
    }

    // 2. Check Wed/Fri (Normal days)
    const day = date.getDay();
    if (day === 3) return { isFast: true, label: "صيام الأربعاء", id: 'wednesday' };
    if (day === 5) return { isFast: true, label: "صيام الجمعة", id: 'friday' };

    return { isFast: false, label: "فطار", id: null };
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        رحلة الصيام الأسبوعية
      </h3>

      <div className="space-y-2">
        {weekDays.map((d, index) => {
          const dateStr = d.toISOString().split('T')[0];
          const info = getFastInfo(d);
          const log = logs[dateStr];
          
          // Determine if "fasted" based on the ID returned
          // If it's a specific fast, check that key. If Wed/Fri, check that key.
          let isFasted = false;
          if (info.id && log?.fastingType) {
             isFasted = !!log.fastingType[info.id as keyof typeof log.fastingType];
          }

          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isFuture = d > new Date();
          const dayName = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(d);

          return (
            <div 
              key={dateStr} 
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isToday ? 'border-purple-300 bg-purple-50' : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                 <div className="flex flex-col items-center w-12 shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold">{dayName}</span>
                    <span className="text-lg font-bold text-slate-800">{d.getDate()}</span>
                 </div>
                 
                 <div className="h-8 w-px bg-slate-200"></div>

                 <div>
                    <p className={`text-sm font-bold ${info.isFast ? 'text-purple-700' : 'text-slate-400'}`}>
                      {info.label}
                    </p>
                    {info.isFast && <span className="text-[10px] text-purple-400">انقطاعي / نباتي</span>}
                 </div>
              </div>

              {info.isFast ? (
                 <button
                   disabled={isFuture}
                   onClick={() => {
                     const currentLog = logs[dateStr] || { date: dateStr, fastingType: {}, prayers: {} } as any;
                     const currentFasting = currentLog.fastingType || {};
                     const newVal = !isFasted;
                     
                     onUpdateLog(dateStr, {
                       fastingType: { ...currentFasting, [info.id!]: newVal }
                     });
                     
                     if (newVal) {
                        onAddPoints(10);
                        if(isToday) onEncourage();
                     }
                   }}
                   className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                     isFasted 
                       ? 'bg-purple-600 text-white shadow-md' 
                       : isFuture
                         ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                         : 'bg-white border-2 border-slate-200 text-slate-300 hover:border-purple-300'
                   }`}
                 >
                   {isFasted ? <Check className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-slate-200" />}
                 </button>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center">
                   <span className="text-slate-300 text-xs">-</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <p className="text-center text-[10px] text-slate-400 mt-4">
        يتم تحديث مواسم الصيام تلقائياً حسب التقويم القبطي
      </p>
    </div>
  );
}