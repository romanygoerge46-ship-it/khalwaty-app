import React, { useState } from 'react';
import { AppState, HazezezEntry } from '../types';
import { Cloud, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
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

  return (
    <div className="space-y-6 pb-20 px-4 pt-6">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-6 h-6 text-sky-500" />
        <h2 className="text-2xl font-bold text-slate-800">تأملاتي (الهذيذ)</h2>
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <textarea
          placeholder="اكتب آية أو تأمل لحفظه..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-3 bg-slate-50 rounded-xl border-0 resize-none h-24 mb-3 focus:ring-2 focus:ring-sky-200"
        />
        <button 
          onClick={handleSave}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          حفظ التأمل
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {state.hazezezHistory.slice().reverse().map((entry) => (
          <div key={entry.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-sky-100">
            {editingId === entry.id ? (
              <div className="space-y-2">
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={() => saveEdit(entry.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    {formatDateArabic(entry.date)}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(entry)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
              </div>
            )}
          </div>
        ))}
        {state.hazezezHistory.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <Cloud className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>مساحتك الخاصة للتأمل.. فارغة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
