import React, { useState } from 'react';
import { EMOTIONS_DATA } from '../lib/data';
import { FeelingEntry } from '../types';
import { X, ArrowRight, Heart, History, Sparkles, Copy } from 'lucide-react';
import { TODAY_ISO, formatDateArabic } from '../lib/utils';

interface Props {
  onClose: () => void;
  onSaveFeeling: (entry: FeelingEntry) => void;
  history: FeelingEntry[];
}

export default function FeelingsModal({ onClose, onSaveFeeling, history }: Props) {
  const [activeTab, setActiveTab] = useState<'select' | 'history'>('select');
  const [selectedEmotionId, setSelectedEmotionId] = useState<string | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  const handleSelectEmotion = (id: string) => {
    setSelectedEmotionId(id);
    // Pick random index
    const emotion = EMOTIONS_DATA.find(e => e.id === id);
    if (emotion) {
      setCurrentVerseIndex(Math.floor(Math.random() * emotion.verses.length));
    }
  };

  const handleSave = () => {
    const emotion = EMOTIONS_DATA.find(e => e.id === selectedEmotionId);
    if (!emotion) return;
    const verse = emotion.verses[currentVerseIndex];

    onSaveFeeling({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      emotionId: emotion.id,
      emotionLabel: emotion.label,
      verseText: verse.text,
      verseRef: verse.ref
    });
    alert("تم حفظ المشاعر في سجلك");
    onClose();
  };

  const tryAnotherVerse = () => {
    const emotion = EMOTIONS_DATA.find(e => e.id === selectedEmotionId);
    if (!emotion) return;
    const nextIndex = (currentVerseIndex + 1) % emotion.verses.length;
    setCurrentVerseIndex(nextIndex);
  };

  const copyVerse = () => {
      const emotion = EMOTIONS_DATA.find(e => e.id === selectedEmotionId);
      if (!emotion) return;
      const verse = emotion.verses[currentVerseIndex];
      const text = `"${verse.text}" (${verse.ref})`;
      navigator.clipboard.writeText(text);
      alert("تم نسخ الآية");
  };

  const selectedEmotion = EMOTIONS_DATA.find(e => e.id === selectedEmotionId);
  const currentVerse = selectedEmotion?.verses[currentVerseIndex];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            {selectedEmotion && activeTab === 'select' && (
              <button onClick={() => setSelectedEmotionId(null)} className="p-1 rounded-full hover:bg-slate-200">
                <ArrowRight className="w-5 h-5 text-slate-600" />
              </button>
            )}
            <h3 className="font-bold text-lg text-slate-800">
              {activeTab === 'history' ? 'سجل مشاعري' : selectedEmotion ? `آيات لـ ${selectedEmotion.label}` : "ماذا تشعر الآن؟"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        {!selectedEmotion && (
          <div className="flex border-b border-slate-100 shrink-0">
            <button 
              onClick={() => setActiveTab('select')}
              className={`flex-1 py-3 text-sm font-bold ${activeTab === 'select' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
            >
              شعور جديد
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-sm font-bold ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
            >
              سجلي ({history.length})
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 bg-white overflow-y-auto flex-1">
          {activeTab === 'select' ? (
            !selectedEmotion ? (
              <div className="grid grid-cols-3 gap-3">
                {EMOTIONS_DATA.map(emotion => (
                  <button
                    key={emotion.id}
                    onClick={() => handleSelectEmotion(emotion.id)}
                    className="aspect-square p-2 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 hover:scale-[1.05] transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-3xl">{emotion.emoji}</span>
                    <span className="font-bold text-xs text-slate-700">{emotion.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between gap-6">
                <div className="text-center animate-in zoom-in duration-300">
                  <span className="text-6xl mb-4 block">{selectedEmotion.emoji}</span>
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden group">
                     <button onClick={copyVerse} className="absolute top-2 left-2 p-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-slate-500">
                         <Copy className="w-4 h-4" />
                     </button>
                     <Sparkles className="absolute top-2 right-2 text-blue-200 w-6 h-6" />
                     <p className="text-xl font-medium text-blue-900 leading-relaxed mb-4 font-serif">
                       "{currentVerse?.text}"
                     </p>
                     <p className="text-sm font-bold text-blue-600">
                       {currentVerse?.ref}
                     </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={tryAnotherVerse}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                  >
                    آية أخرى
                  </button>
                  <button 
                    onClick={handleSave}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5 fill-white" />
                    حفظ في مشاعري
                  </button>
                </div>
              </div>
            )
          ) : (
            // History Tab
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>لم تقم بحفظ أي مشاعر بعد</p>
                </div>
              ) : (
                history.slice().reverse().map((entry) => (
                  <div key={entry.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                       <span className="px-2 py-1 bg-white rounded-lg text-xs font-bold border border-slate-100">
                         {entry.emotionLabel}
                       </span>
                       <span className="text-xs text-slate-400">
                         {formatDateArabic(entry.date)}
                       </span>
                    </div>
                    <p className="text-slate-800 text-sm mb-1 font-medium">"{entry.verseText}"</p>
                    <p className="text-xs text-blue-600 font-bold text-left">{entry.verseRef}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}