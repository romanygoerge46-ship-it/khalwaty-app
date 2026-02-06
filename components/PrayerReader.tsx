import React, { useState, useEffect } from 'react';
import { PRAYER_STRUCTURE } from '../lib/data';
import { X, ChevronDown, ChevronRight, ChevronLeft, Volume2, StopCircle, CheckCircle } from 'lucide-react';

interface Props {
  prayerKey: string;
  onClose: () => void;
  onComplete: () => void;
}

export default function PrayerReader({ prayerKey, onClose, onComplete }: Props) {
  const prayerData = PRAYER_STRUCTURE[prayerKey as keyof typeof PRAYER_STRUCTURE];
  const [activeSectionId, setActiveSectionId] = useState(prayerData.sections[0].id);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeSectionIndex = prayerData.sections.findIndex(s => s.id === activeSectionId);
  const activeSection = prayerData.sections[activeSectionIndex];

  // Stop speech when section changes or component unmounts
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [activeSectionId]);

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if (!activeSection?.content) return;
      
      const utterance = new SpeechSynthesisUtterance(activeSection.content);
      utterance.lang = 'ar-EG'; // Egyptian Arabic preference
      utterance.rate = 0.85; // Slightly slower for reading
      utterance.onend = () => setIsPlaying(false);
      
      // Error handling
      utterance.onerror = (e) => {
        console.error("Speech error", e);
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (activeSectionIndex < prayerData.sections.length - 1) {
      setActiveSectionId(prayerData.sections[activeSectionIndex + 1].id);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrev = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionId(prayerData.sections[activeSectionIndex - 1].id);
    }
  };

  const handleMarkComplete = () => {
    if (window.confirm("هل أتممت الصلاة بالكامل؟ سيتم احتساب النقاط.")) {
      onComplete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{prayerData.title}</h2>
        </div>
        <div className="flex items-center gap-2">
             <button 
                onClick={handleMarkComplete}
                className="p-2 bg-green-600/20 text-green-400 hover:bg-green-600/40 rounded-full flex items-center gap-1"
                title="إتمام الصلاة"
             >
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs font-bold hidden sm:inline">إتمام</span>
             </button>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* Navigation Dropdown */}
      <div className="bg-slate-100 p-4 border-b border-slate-200">
        <div className="relative">
          <select 
            value={activeSectionId}
            onChange={(e) => setActiveSectionId(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-300 text-slate-900 font-bold py-3 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {prayerData.sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-slate-500">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col items-center">
        <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[50vh] mb-4 relative">
          
          {/* TTS Button inside content area */}
          <button 
            onClick={toggleSpeech}
            className={`absolute top-4 left-4 p-3 rounded-full shadow-sm transition-all ${
                isPlaying 
                ? 'bg-red-50 text-red-500 animate-pulse ring-2 ring-red-200' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title={isPlaying ? "إيقاف القراءة" : "استماع"}
          >
            {isPlaying ? <StopCircle className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>

          <h3 className="text-2xl font-bold text-center text-blue-900 mb-8 font-[Cairo] px-8">
            {activeSection?.title}
          </h3>
          <div className="text-lg leading-loose text-slate-800 whitespace-pre-wrap font-serif text-justify" dir="rtl">
            {activeSection?.content}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-white border-t border-slate-100 pb-safe flex gap-3">
        <button 
          onClick={handlePrev}
          disabled={activeSectionIndex === 0}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ChevronRight className="w-5 h-5" />
          السابق
        </button>
        
        <button 
          onClick={handleNext}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {activeSectionIndex === prayerData.sections.length - 1 ? "إنهاء الصلاة (+20)" : "التالي"}
          {activeSectionIndex !== prayerData.sections.length - 1 && <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}