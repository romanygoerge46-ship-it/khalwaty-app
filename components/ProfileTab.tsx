
import React, { useState } from 'react';
import { AppState, UserProfile } from '../types';
import { User, Shield, LogOut, Trash2, Heart, Lock, Key, ChevronLeft, Church, Calendar, Check, Edit2, X, Cloud } from 'lucide-react';
import { formatDateArabic } from '../lib/utils';

interface Props {
  currentUser: string;
  state: AppState;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetConfessionPin: () => void;
  onLogout: () => void;
  onClearData: () => void;
  onOpenDonation: () => void;
  onUpdateMeditationsPin: (pin: string | null) => void;
}

export default function ProfileTab({ currentUser, state, onUpdateProfile, onResetConfessionPin, onLogout, onClearData, onOpenDonation, onUpdateMeditationsPin }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ displayName: state.profile.displayName || currentUser, church: state.profile.church || '' });
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Modals
  const [showConfessionReset, setShowConfessionReset] = useState(false);
  const [showMeditationsPinModal, setShowMeditationsPinModal] = useState(false);
  const [newMeditationPin, setNewMeditationPin] = useState("");

  const handleSaveProfile = () => {
    if (!formData.displayName.trim()) { setValidationError("يجب كتابة الاسم"); return; }
    onUpdateProfile(formData);
    setValidationError(null);
    setIsEditing(false);
  };

  const handleSetMeditationsPin = () => {
     if (newMeditationPin.length === 4) {
         onUpdateMeditationsPin(newMeditationPin);
         setShowMeditationsPinModal(false);
         setNewMeditationPin("");
     } else {
         alert("يجب أن يكون الرمز 4 أرقام");
     }
  };

  const handleRemoveMeditationsPin = () => {
      if(window.confirm("إزالة القفل عن التأملات؟")) {
          onUpdateMeditationsPin(null);
          setShowMeditationsPinModal(false);
      }
  };

  const inputClass = "w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-colors text-sm placeholder:text-slate-400";

  return (
    <div className="space-y-6 pb-24 md:pb-0 px-4 pt-6 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">إعدادات الحساب</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <div className="relative z-10 -mt-2 w-full">
                    <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-3 mx-auto">
                        <span className="text-3xl font-bold text-blue-600">{(state.profile.displayName || currentUser).charAt(0).toUpperCase()}</span>
                    </div>
                    {!isEditing ? (
                        <>
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 justify-center">{state.profile.displayName || currentUser}</h3>
                            <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1"><Calendar className="w-3 h-3" /> عضو منذ {formatDateArabic(state.profile.joinDate)}</p>
                            <button onClick={() => setIsEditing(true)} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto hover:bg-blue-100 transition-colors"><Edit2 className="w-4 h-4" /> تعديل البيانات</button>
                        </>
                    ) : (
                        <div className="w-full max-w-xs mx-auto space-y-3 mt-4">
                            <input value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className={inputClass} placeholder="الاسم" />
                            <div className="flex gap-2 justify-center pt-2">
                                <button onClick={handleSaveProfile} className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-green-700"><Check className="w-4 h-4" /> حفظ</button>
                                <button onClick={() => setIsEditing(false)} className="px-4 bg-slate-200 text-slate-600 py-2 rounded-xl font-bold text-sm hover:bg-slate-300"><X className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Confession PIN */}
                <button onClick={() => setShowConfessionReset(true)} className="w-full bg-white p-5 flex items-center justify-between rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><Key className="w-6 h-6" /></div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800 text-base">رمز الاعتراف</p>
                            <p className="text-xs text-slate-400 mt-1">إعادة تعيين الرمز السري</p>
                        </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>

                {/* Meditations PIN */}
                <button onClick={() => setShowMeditationsPinModal(true)} className="w-full bg-white p-5 flex items-center justify-between rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="bg-sky-100 p-3 rounded-xl text-sky-600"><Cloud className="w-6 h-6" /></div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800 text-base">قفل التأملات</p>
                            <p className="text-xs text-slate-400 mt-1">{state.meditationsPin ? 'تغيير / إزالة القفل' : 'تفعيل الحماية'}</p>
                        </div>
                    </div>
                    {state.meditationsPin && <Lock className="w-5 h-5 text-sky-500" />}
                </button>

                {/* Donation */}
                <button onClick={onOpenDonation} className="w-full bg-white p-5 flex items-center justify-between rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><Heart className="w-6 h-6" /></div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800 text-base">دعم التطبيق</p>
                            <p className="text-xs text-slate-400 mt-1">تبرع لتطوير الخدمة</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-white p-2 rounded-2xl border border-red-100 shadow-sm mt-6">
                <button onClick={() => { if(prompt("اكتب 'حذف' للتأكيد:") === 'حذف') onClearData(); }} className="w-full p-4 flex items-center justify-between hover:bg-red-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-100 p-2 rounded-full text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors"><Trash2 className="w-5 h-5" /></div>
                        <div className="text-right"><p className="font-bold text-red-600 text-sm">حذف جميع البيانات</p></div>
                    </div>
                </button>
                <div className="h-px bg-slate-100 mx-4 my-1"></div>
                <button onClick={onLogout} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-2 rounded-full text-slate-500 group-hover:bg-slate-800 group-hover:text-white transition-colors"><LogOut className="w-5 h-5" /></div>
                        <div className="text-right"><p className="font-bold text-slate-700 text-sm">تسجيل الخروج</p></div>
                    </div>
                </button>
            </div>
        </div>
      </div>

      {/* Confession Reset Modal */}
      {showConfessionReset && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                  <h3 className="font-bold text-lg mb-4">إعادة تعيين رمز الاعتراف</h3>
                  <p className="text-sm text-slate-500 mb-6">سيتم حذف الرمز الحالي والسماح بإنشاء جديد.</p>
                  <div className="flex gap-2">
                     <button onClick={() => { onResetConfessionPin(); setShowConfessionReset(false); }} className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-bold">تأكيد</button>
                     <button onClick={() => setShowConfessionReset(false)} className="px-4 bg-slate-200 rounded-xl font-bold">إلغاء</button>
                  </div>
              </div>
          </div>
      )}

      {/* Meditations PIN Modal */}
      {showMeditationsPinModal && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg">حماية التأملات</h3>
                     <button onClick={() => setShowMeditationsPinModal(false)}><X className="w-5 h-5 text-slate-400"/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 block">تعيين رمز جديد (4 أرقام)</label>
                          <input 
                              type="password" 
                              maxLength={4}
                              value={newMeditationPin}
                              onChange={(e) => setNewMeditationPin(e.target.value)}
                              className="w-full text-center text-2xl tracking-[0.5em] border-2 border-slate-200 rounded-xl py-3 font-bold focus:border-sky-500 focus:outline-none"
                              placeholder="••••"
                          />
                      </div>
                      <button onClick={handleSetMeditationsPin} className="w-full bg-sky-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-sky-200">
                          {state.meditationsPin ? 'تحديث الرمز' : 'تفعيل الحماية'}
                      </button>
                      
                      {state.meditationsPin && (
                          <button onClick={handleRemoveMeditationsPin} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold border border-red-100 hover:bg-red-100">
                              إزالة الحماية
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
