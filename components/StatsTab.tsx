import React from 'react';
import { AppState } from '../types';
import { TrendingUp, Flame } from 'lucide-react';

interface Props {
  state: AppState;
}

export default function StatsTab({ state }: Props) {
  // Candle Wreath Logic: Simple visual based on Spiritual Points
  // Every 100 points lights up a "candle" in the wreath ring
  const candlesLit = Math.min(12, Math.floor(state.stats.spiritualPoints / 100));

  return (
    <div className="space-y-6 pb-20 px-4 pt-6">
      <h2 className="text-2xl font-bold text-slate-800">إكليل جهادي</h2>

      {/* Candle Wreath Visualization */}
      <div className="relative flex items-center justify-center py-10">
        <div className="w-64 h-64 rounded-full border-4 border-slate-100 relative flex items-center justify-center bg-white shadow-inner">
          
          {/* Candles in a circle */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30) - 90; // Start from top
            const radius = 100; // Distance from center
            const x = radius * Math.cos((angle * Math.PI) / 180);
            const y = radius * Math.sin((angle * Math.PI) / 180);
            const isLit = i < candlesLit;

            return (
              <div 
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
                style={{ 
                  left: `calc(50% + ${x}px)`, 
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`
                }}
              >
                <div className={`flex flex-col items-center ${isLit ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                  {isLit && <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse mb-1" />}
                  <div className={`w-3 h-8 rounded-sm ${isLit ? 'bg-amber-100 border border-amber-200' : 'bg-slate-200'}`}></div>
                </div>
              </div>
            );
          })}

          <div className="text-center z-10">
             <h3 className="text-4xl font-bold text-slate-800">{state.stats.spiritualPoints}</h3>
             <p className="text-slate-400 text-sm">نقطة روحية</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-1">أطول فترة</p>
          <p className="text-2xl font-bold text-slate-800">{state.stats.longestStreak} يوم</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Flame className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-1">أيام صيام</p>
          <p className="text-2xl font-bold text-slate-800">{state.stats.totalFastingDays}</p>
        </div>
      </div>

      {/* Bible Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2">تقدم قراءة الإنجيل</h3>
        <p className="text-slate-500 mb-4">
          تمت قراءة <span className="text-blue-600 font-bold">{state.stats.bibleProgress.totalChaptersRead}</span> أصحاح من العهد الجديد.
        </p>
      </div>
    </div>
  );
}
