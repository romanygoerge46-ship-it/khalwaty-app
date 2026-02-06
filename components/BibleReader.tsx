import React, { useState, useEffect } from 'react';
import { BibleProgress } from '../types';
import { NEW_TESTAMENT_BOOKS } from '../lib/data';
import { X, ChevronDown, BookOpen, Heart } from 'lucide-react';

interface Props {
  progress: BibleProgress;
  onClose: () => void;
  onComplete: (newProgress: BibleProgress) => void;
  touchedMeText: string;
  onUpdateTouchedMe: (text: string) => void;
  isCompletedToday: boolean;
}

export default function BibleReader({ 
  progress, onClose, onComplete, touchedMeText, onUpdateTouchedMe, isCompletedToday 
}: Props) {
  const [selectedBookIndex, setSelectedBookIndex] = useState(progress.currentBookIndex);
  const [selectedChapter, setSelectedChapter] = useState(progress.currentChapter);
  
  const selectedBook = NEW_TESTAMENT_BOOKS[selectedBookIndex];
  
  // Reset local state when props change
  useEffect(() => {
    setSelectedBookIndex(progress.currentBookIndex);
    setSelectedChapter(progress.currentChapter);
  }, [progress]);

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndex = parseInt(e.target.value);
    setSelectedBookIndex(newIndex);
    setSelectedChapter(1); // Reset to chapter 1 on book change
  };

  const handleNextChapter = () => {
    // Only advance global progress if we are reading the "current" assigned chapter
    const isReadingAssigned = 
      selectedBookIndex === progress.currentBookIndex && 
      selectedChapter === progress.currentChapter;

    if (isReadingAssigned) {
      let nextChapter = progress.currentChapter + 1;
      let nextBookIndex = progress.currentBookIndex;

      if (nextChapter > NEW_TESTAMENT_BOOKS[nextBookIndex].chapters) {
        nextChapter = 1;
        nextBookIndex++;
      }
      
      if (nextBookIndex < NEW_TESTAMENT_BOOKS.length) {
         onComplete({
           currentBookIndex: nextBookIndex,
           currentChapter: nextChapter,
           totalChaptersRead: progress.totalChaptersRead + 1,
           lastReadVerse: 0 // Start new chapter from verse 0
         });
      } else {
        alert("مبروك! لقد أتممت قراءة العهد الجديد!");
      }
    } else {
      // Just navigation
      let nextCh = selectedChapter + 1;
      if (nextCh > selectedBook.chapters) {
        nextCh = 1;
        // Logic to move to next book for reading only would go here
      }
      setSelectedChapter(nextCh);
    }
  };

  // Mock text generator based on book/chapter to simulate real content
  const getMockChapterText = () => {
    return `
    (نص محاكي لـ ${selectedBook.name} - أصحاح ${selectedChapter})
    
    1. في البدء... (هنا يظهر النص الكامل للأصحاح).
    2. وهذا النص وضعه المطور كمثال لأن النص الكامل يحتاج مساحة تخزين كبيرة.
    3. تخيل أنك تقرأ كلمات الرب المقدسة الآن.
    4. طوبى للذي يقرأ وللذين يسمعون أقوال النبوة.
    5. ...
    6. ...
    (يستمر النص لنهاية الأصحاح)
    `;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
           <BookOpen className="w-5 h-5 text-blue-300" />
           <h2 className="text-lg font-bold">الكتاب المقدس</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="bg-slate-100 p-3 border-b border-slate-200 grid grid-cols-2 gap-3">
        <div className="relative">
          <select 
            value={selectedBookIndex}
            onChange={handleBookChange}
            className="w-full appearance-none bg-white border border-slate-300 text-slate-900 font-bold py-2 px-3 rounded-lg text-sm shadow-sm"
          >
            {NEW_TESTAMENT_BOOKS.map((book, idx) => (
              <option key={idx} value={idx}>{book.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select 
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
            className="w-full appearance-none bg-white border border-slate-300 text-slate-900 font-bold py-2 px-3 rounded-lg text-sm shadow-sm"
          >
            {[...Array(selectedBook.chapters)].map((_, i) => (
              <option key={i + 1} value={i + 1}>أصحاح {i + 1}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#fdfbf7]">
        <div className="max-w-2xl mx-auto p-6">
          <h3 className="text-3xl font-bold text-center text-slate-800 mb-8 font-[Cairo]">
            {selectedBook.name} {selectedChapter}
          </h3>
          <div className="text-xl leading-loose text-slate-900 font-serif text-justify" dir="rtl">
            {getMockChapterText()}
          </div>
          
          {/* Action Button */}
          <div className="mt-10 mb-6">
            {!isCompletedToday && selectedBookIndex === progress.currentBookIndex && selectedChapter === progress.currentChapter ? (
              <button 
                onClick={handleNextChapter}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                أتممت القراءة (+50 نقطة)
              </button>
            ) : (
              <div className="text-center text-slate-500 text-sm">
                {isCompletedToday ? "لقد قرأت الورد اليومي ✅" : "أنت تتصفح أصحاحاً آخر"}
              </div>
            )}
          </div>

          <hr className="border-slate-200 my-8" />

          {/* Touched Me Section - Inside the Reader */}
          <div className="bg-white p-5 rounded-2xl border border-pink-100 shadow-sm">
             <h4 className="font-bold text-pink-700 mb-3 flex items-center gap-2">
               <Heart className="w-5 h-5 fill-pink-100" />
               أكتر حاجة لمستني في الأصحاح
             </h4>
             <textarea
               placeholder="اكتب الآية أو الكلمة اللي لمست قلبك..."
               value={touchedMeText}
               onChange={(e) => onUpdateTouchedMe(e.target.value)}
               className="w-full p-3 bg-pink-50 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-300 h-24 resize-none"
             />
          </div>
        </div>
      </div>
    </div>
  );
}