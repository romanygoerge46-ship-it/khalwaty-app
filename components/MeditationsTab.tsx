
import React, { useState } from 'react';
import { AppState, HazezezEntry } from '../types';
import { Cloud, Plus, Trash2, Edit2, Save, X, Lock, Unlock } from 'lucide-react';
import { formatDateArabic, TODAY_ISO } from '../lib/utils';

interface Props {
  state: AppState;
  onAddHazezez: (entry: HazezezEntry) => void;
  onUpdateHazezez: (entries: HazezezEntry[]) => void;
}

export default function MeditationsTab({ state, onAddHazezez, onUpdateHazezez }: Props) {
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
  // Use state.meditationsPin (we assume it exists on AppState now)
  const hasPin = !!state.meditationsPin;

  const handleUnlock = () => {
      if (pinInput === state.meditationsPin) {
          setIsUnlocked(true);
          setPinInput("");
      } else {
          alert("الرمز خطأ");
          setPinInput("");
      }
  };

  const handleSave = () => {
    if (!inputText.trim()) return;
    onAddHazezez({
      id: Date.now().toString(),
      date: TODAY_ISO,
      text: inputText
    });
    setInputText("");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التأمل؟")) {
      onUpdateHazezez(state.hazezezHistory.filter(h => h.id !== id));
    }
  };

  const startEdit = (entry: HazezezEntry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };

  const saveEdit = (id: string) => {
    const updated = state.hazezezHistory.map(h => h.id === id ? { ...h, text: editText } : h);
    onUpdateHazezez(updated);
    setEditingId(null);
  };

  // Render Locked State if PIN is set and not unlocked
  if (hasPin && !isUnlocked) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in zoom-in-95">
              <div className="bg-sky-100 p-6 rounded-full mb-2">
                  <Lock className="w-12 h-12 text-sky-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">تأملاتك محمية</h3>
              <p className="text-slate-500 text-sm">أدخل الرمز السري الخاص بالتأملات</p>
              
              <div className="flex justify-center gap-2">
                <input 
                type="password" 
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="text-center text-4xl tracking-[1em] w-48 border-b-2 border-sky-300 focus:outline-none focus:border-sky-600 bg-transparent py-2 font-bold text-sky-800"
                placeholder="••••"
                />
             </div>
             <button 
                onClick={handleUnlock}
                className="bg-sky-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-sky-200 hover:bg-sky-700 transition-colors"
             >
                فتح التأملات
             </button>
          </div>
      )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0 px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-sky-500" />
            <h2 className="text-2xl font-bold text-slate-800">تأملاتي (الهذيذ)</h2>
        </div>
        {hasPin && (
            <button onClick={() => setIsUnlocked(false)} className="text-slate-400 hover:text-sky-600">
                <Lock className="w-5 h-5" />
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Input Area (Sticky on Desktop) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <label className="text-sm font-bold text-slate-600 mb-2 block">تأمل جديد</label>
                <textarea
                placeholder="اكتب آية أو تأمل لحفظه..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-xl border-0 resize-none h-40 mb-4 focus:ring-2 focus:ring-sky-200 focus:outline-none"
                />
                <button 
                onClick={handleSave}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-100"
                >
                <Plus className="w-5 h-5" />
                حفظ التأمل
                </button>
            </div>
            
            <div className="mt-4 bg-sky-50 p-4 rounded-xl border border-sky-100 hidden lg:block">
                <p className="text-xs text-sky-700 leading-relaxed font-bold">
                    "خبأت كلامك في قلبي لكيلا أخطئ إليك." <br/> (مزمور 119: 11)
                </p>
            </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
            {state.hazezezHistory.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100 border-dashed">
                <Cloud className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-bold">مساحتك الخاصة للتأمل.. فارغة حالياً</p>
                <p className="text-sm mt-2 opacity-70">ابدأ بكتابة آية أعجبتك اليوم.</p>
            </div>
            ) : (
                state.hazezezHistory.slice().reverse().map((entry) => (
                <div key={entry.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-sky-200 group">
                    {editingId === entry.id ? (
                    <div className="space-y-3">
                        <textarea 
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-200"
                        rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1">
                            <X className="w-3 h-3" /> إلغاء
                        </button>
                        <button onClick={() => saveEdit(entry.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-1">
                            <Save className="w-3 h-3" /> حفظ
                        </button>
                        </div>
                    </div>
                    ) : (
                    <div>
                        <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                            {formatDateArabic(entry.date)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(entry)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        </div>
                        <p className="text-slate-800 leading-loose whitespace-pre-wrap text-lg font-medium">{entry.text}</p>
                    </div>
                    )}
                </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
