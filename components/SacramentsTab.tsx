import React, { useState } from 'react';
import { AppState, SacramentsLog, ArchivedConfession } from '../types';
import { formatDateArabic, TODAY_ISO } from '../lib/utils';
import { Lock, Unlock, Users, CalendarPlus, Save, Trash2, History, Plus, Check, X, Edit3, HelpCircle, ArrowRight } from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateSacraments: (updates: Partial<SacramentsLog>) => void;
}

export default function SacramentsTab({ state, onUpdateSacraments }: Props) {
  const { sacraments } = state;
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showSetupPin, setShowSetupPin] = useState(false);
  
  // Editor State
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [editorText, setEditorText] = useState("");

  // PIN Logic
  const handleUnlock = () => {
    if (pinInput === sacraments.confession.pin) {
      setIsUnlocked(true);
      setPinInput("");
    } else {
      alert("الرقم السري غير صحيح");
      setPinInput("");
    }
  };

  const handleSetupPin = () => {
    if (pinInput.length === 4) {
      onUpdateSacraments({ 
        confession: { ...sacraments.confession, pin: pinInput } 
      });
      setShowSetupPin(false);
      setIsUnlocked(true);
      setPinInput("");
    }
  };

  const handleForgotPin = () => {
    if(window.confirm("لإعادة تعيين الرقم السري، يرجى التواصل مع الدعم الفني من الصفحة الرئيسية، أو يمكنك مسح بيانات التطبيق بالكامل إذا لم يكن لديك بيانات هامة.")) {
        // Just an info prompt currently since we don't have email reset
    }
  };

  // Note Logic
  const handleNewNote = () => {
    setActiveNoteId(null);
    setEditorText("");
    setViewMode('editor');
  };

  const handleEditNote = (note: ArchivedConfession) => {
    setActiveNoteId(note.id);
    setEditorText(note.text);
    setViewMode('editor');
  };

  const handleSaveNote = () => {
    if (!editorText.trim()) return;

    let updatedHistory = [...(sacraments.confession.history || [])];

    if (activeNoteId) {
      // Update existing
      updatedHistory = updatedHistory.map(n => 
        n.id === activeNoteId ? { ...n, text: editorText, date: new Date().toISOString() } : n
      );
    } else {
      // Create new
      const newNote: ArchivedConfession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        text: editorText
      };
      updatedHistory = [newNote, ...updatedHistory];
    }

    onUpdateSacraments({
      confession: { 
        ...sacraments.confession, 
        history: updatedHistory,
        currentNote: "" // Ensure legacy field is clear
      }
    });

    setViewMode('list');
    setEditorText("");
    setActiveNoteId(null);
  };

  const handleDeleteNote = (id: string) => {
    if(!window.confirm("حذف هذه النوتة نهائياً؟")) return;
    const updatedHistory = sacraments.confession.history.filter(h => h.id !== id);
    onUpdateSacraments({
      confession: { ...sacraments.confession, history: updatedHistory }
    });
    if (activeNoteId === id) {
        setViewMode('list');
    }
  };

  const toggleLiturgy = (dayOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    const exists = sacraments.liturgyAttendance.includes(dateStr);
    let newAttendance;
    if (exists) {
      newAttendance = sacraments.liturgyAttendance.filter(d => d !== dateStr);
    } else {
      newAttendance = [dateStr, ...sacraments.liturgyAttendance];
    }
    onUpdateSacraments({ liturgyAttendance: newAttendance });
  };

  return (
    <div className="space-y-6 pb-20 px-4 pt-6">
      <h2 className="text-2xl font-bold text-slate-800">الأسرار المقدسة</h2>

      {/* Confession Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Users className="w-5 h-5 text-purple-600" />
             <h3 className="font-bold text-purple-900">نوتة الاعتراف</h3>
           </div>
           <div className="flex gap-2 items-center">
              {isUnlocked && viewMode === 'editor' && (
                  <button onClick={() => setViewMode('list')} className="text-xs font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1">
                      <ArrowRight className="w-4 h-4" /> عودة
                  </button>
              )}
              {isUnlocked ? <Unlock className="w-4 h-4 text-purple-400" /> : <Lock className="w-4 h-4 text-purple-400" />}
           </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {!sacraments.confession.pin && !showSetupPin ? (
            // Setup PIN Mode
            <div className="text-center py-10 flex flex-col items-center justify-center h-full">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                 <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-slate-500 mb-6 font-medium">لم تقم بتعيين رقم سري لنوتة الاعتراف.</p>
              <button 
                onClick={() => setShowSetupPin(true)}
                className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-200"
              >
                إنشاء رقم سري
              </button>
            </div>
          ) : !isUnlocked ? (
            // Locked Mode
            <div className="text-center py-4 flex flex-col items-center justify-center h-full">
               <h4 className="font-bold mb-6 text-xl text-slate-700">{showSetupPin ? "تعيين رقم جديد (4 أرقام)" : "أدخل الرقم السري"}</h4>
               <div className="flex justify-center gap-2 mb-8">
                 <input 
                   type="password" 
                   maxLength={4}
                   value={pinInput}
                   onChange={(e) => setPinInput(e.target.value)}
                   className="text-center text-4xl tracking-[1em] w-48 border-b-2 border-purple-300 focus:outline-none focus:border-purple-600 bg-transparent py-2 font-bold text-purple-800"
                   placeholder="••••"
                 />
               </div>
               <button 
                onClick={showSetupPin ? handleSetupPin : handleUnlock}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl mb-4"
               >
                 {showSetupPin ? "حفظ الرقم السري" : "فتح النوتة"}
               </button>
               
               {!showSetupPin && (
                   <button onClick={handleForgotPin} className="text-xs text-slate-400 font-bold hover:text-purple-600 flex items-center gap-1">
                       <HelpCircle className="w-3 h-3" /> نسيت كلمة السر؟
                   </button>
               )}
            </div>
          ) : viewMode === 'list' ? (
             // List View
             <div className="flex flex-col h-full">
                 <div className="flex justify-between items-center mb-4">
                     <h4 className="font-bold text-slate-700">سجل اعترافاتي</h4>
                     <button 
                        onClick={handleNewNote}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:bg-purple-700"
                     >
                         <Plus className="w-4 h-4" /> نوتة جديدة
                     </button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                     {sacraments.confession.history?.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                             <History className="w-12 h-12 mb-2" />
                             <p>لا توجد نوتات سابقة</p>
                         </div>
                     ) : (
                         sacraments.confession.history.map(item => (
                             <div 
                                key={item.id} 
                                onClick={() => handleEditNote(item)}
                                className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all cursor-pointer group"
                             >
                                 <div className="flex justify-between items-start mb-2">
                                     <span className="text-xs font-bold text-purple-600 bg-white px-2 py-1 rounded border border-purple-100">{formatDateArabic(item.date)}</span>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(item.id); }} 
                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                         <Trash2 className="w-4 h-4" />
                                     </button>
                                 </div>
                                 <p className="text-sm text-slate-700 line-clamp-2">{item.text}</p>
                             </div>
                         ))
                     )}
                 </div>
                 
                 <button 
                    onClick={() => setIsUnlocked(false)}
                    className="w-full mt-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-200"
                 >
                    إغلاق النوتة
                 </button>
             </div>
          ) : (
            // Editor View
            <div className="flex flex-col h-full">
              <textarea
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                placeholder="اكتب هنا خطاياك وافكارك للاعتراف..."
                className="w-full flex-1 p-4 bg-yellow-50/50 rounded-xl border border-yellow-100 resize-none focus:ring-2 focus:ring-yellow-200 focus:outline-none mb-4 text-slate-800 leading-relaxed"
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={handleSaveNote}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                >
                  <Save className="w-5 h-5" />
                  حفظ في السجل
                </button>
                {activeNoteId && (
                    <button 
                    onClick={() => handleDeleteNote(activeNoteId)}
                    className="px-4 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl"
                    >
                    <Trash2 className="w-5 h-5" />
                    </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liturgy Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarPlus className="w-5 h-5 text-red-500" />
          سجل القداسات (آخر 7 أيام)
        </h3>
        <div className="grid grid-cols-7 gap-1">
           {[...Array(7)].map((_, i) => {
             const d = new Date();
             d.setDate(d.getDate() - (6 - i));
             const dateStr = d.toISOString().split('T')[0];
             const attended = sacraments.liturgyAttendance.includes(dateStr);
             const dayName = new Intl.DateTimeFormat('ar-EG', { weekday: 'short' }).format(d);

             return (
               <button
                 key={i}
                 onClick={() => toggleLiturgy(6 - i)}
                 className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                   attended ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-transparent opacity-50'
                 }`}
               >
                 <span className="text-xs font-bold text-slate-500">{dayName}</span>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                   attended ? 'bg-red-500 text-white' : 'bg-slate-200'
                 }`}>
                   {attended && <Check className="w-5 h-5" />}
                 </div>
               </button>
             );
           })}
        </div>
      </div>

      {/* Manual Date Entry for Records */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
         <div>
           <p className="font-bold text-slate-700">آخر اعتراف</p>
           <p className="text-xs text-slate-500">{formatDateArabic(sacraments.confession.lastConfession || '')}</p>
         </div>
         <input 
           type="date"
           className="bg-slate-100 rounded-lg p-2 text-sm"
           onChange={(e) => onUpdateSacraments({ 
             confession: { ...sacraments.confession, lastConfession: e.target.value } 
           })}
         />
      </div>

    </div>
  );
}