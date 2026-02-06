import React, { useState } from 'react';
import { AppState, UserProfile } from '../types';
import { User, Settings, Shield, LogOut, Trash2, Heart, Lock, Key, ChevronLeft, Church, Calendar, Check, Edit2, X } from 'lucide-react';
import { formatDateArabic } from '../lib/utils';

interface Props {
  currentUser: string;
  state: AppState;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetConfessionPin: () => void;
  onLogout: () => void;
  onClearData: () => void;
}

export default function ProfileTab({ currentUser, state, onUpdateProfile, onResetConfessionPin, onLogout, onClearData }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Temporary state for editing - simplified
  const [formData, setFormData] = useState({
    displayName: state.profile.displayName || currentUser,
    church: state.profile.church || '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSaveProfile = () => {
    if (!formData.displayName.trim()) {
        setValidationError("يجب كتابة الاسم");
        return;
    }

    onUpdateProfile(formData);
    setValidationError(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData({
      displayName: state.profile.displayName || currentUser,
      church: state.profile.church || '',
    });
    setValidationError(null);
    setIsEditing(false);
  };

  const handleResetPinConfirm = () => {
      onResetConfessionPin();
      setShowConfirmModal(false);
  };

  const handleClearDataConfirm = () => {
      const confirmText = prompt("تحذير: هذا الإجراء سيحذف كافة بياناتك (الصلوات، المذكرات، الإحصائيات). للتأكيد، اكتب 'حذف':");
      if (confirmText === 'حذف') {
          onClearData();
      }
  };

  // High contrast input style
  const inputClass = "w-full p-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-colors text-sm placeholder:text-slate-400";

  return (
    <div className="space-y-6 pb-24 px-4 pt-6 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">إعدادات الحساب</h2>

      {/* User Info Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>
         
         <div className="relative z-10 -mt-2 w-full">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-3 mx-auto">
                <span className="text-3xl font-bold text-blue-600">
                    {(state.profile.displayName || currentUser).charAt(0).toUpperCase()}
                </span>
            </div>
            
            {!isEditing ? (
                <>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 justify-center">
                        {state.profile.displayName || currentUser}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        عضو منذ {formatDateArabic(state.profile.joinDate)}
                    </p>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto hover:bg-blue-100 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" /> تعديل البيانات
                    </button>
                </>
            ) : (
                <div className="w-full max-w-xs mx-auto space-y-3 mt-4">
                     {validationError && (
                         <div className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                             {validationError}
                         </div>
                     )}
                     <div className="space-y-1 text-right">
                         <label className="text-[10px] font-bold text-slate-500 mr-2">الاسم</label>
                         <input 
                            value={formData.displayName} 
                            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                            className={inputClass}
                            placeholder="الاسم"
                        />
                     </div>
                     <div className="flex gap-2 justify-center pt-2">
                         <button onClick={handleSaveProfile} className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 hover:bg-green-700">
                             <Check className="w-4 h-4" /> حفظ
                         </button>
                         <button onClick={handleCancelEdit} className="px-4 bg-slate-200 text-slate-600 py-2 rounded-xl font-bold text-sm hover:bg-slate-300">
                             <X className="w-4 h-4" />
                         </button>
                     </div>
                </div>
            )}
         </div>
      </div>

      {/* Simplified Personal Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              البيانات الشخصية
          </div>
          <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-500 shrink-0"><Church className="w-4 h-4" /></div>
                  <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">الكنيسة / الإيبارشية</p>
                      {isEditing ? (
                          <input 
                            value={formData.church}
                            onChange={(e) => setFormData({...formData, church: e.target.value})}
                            className={inputClass}
                            placeholder="اسم الكنيسة..."
                          />
                      ) : (
                          <p className="text-sm font-bold text-slate-800">{state.profile.church || 'غير محدد'}</p>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* Settings Buttons */}
      <div className="space-y-3">
          
          {/* Confession Settings */}
          <button 
             onClick={() => setShowConfirmModal(true)}
             className="w-full bg-white p-4 flex items-center justify-between rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-all group"
          >
              <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Key className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                      <p className="font-bold text-slate-800 text-sm">إعادة تعيين رمز الاعتراف</p>
                      <p className="text-[10px] text-slate-400">سيتم مسح الرمز الحالي</p>
                  </div>
              </div>
              <ChevronLeft className="w-5 h-5 text-slate-300" />
          </button>

          {/* Subscription */}
          <div className="w-full bg-white p-4 flex items-center justify-between rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-4">
                 <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                     <Shield className="w-5 h-5" />
                 </div>
                 <div className="text-right">
                     <p className="font-bold text-slate-800 text-sm">حالة الاشتراك</p>
                     <p className="text-[10px] text-slate-400">
                         {state.adsRemoved ? "نسخة خالية من الإعلانات" : "النسخة المجانية"}
                     </p>
                 </div>
             </div>
             {state.adsRemoved && <Heart className="w-5 h-5 text-red-500 fill-red-500" />}
          </div>

          {/* Danger Zone */}
          <div className="bg-white p-2 rounded-2xl border border-red-100 shadow-sm mt-6">
             <button 
               onClick={handleClearDataConfirm}
               className="w-full p-4 flex items-center justify-between hover:bg-red-50 rounded-xl transition-colors group"
             >
                 <div className="flex items-center gap-4">
                     <div className="bg-red-100 p-2 rounded-full text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                         <Trash2 className="w-5 h-5" />
                     </div>
                     <div className="text-right">
                         <p className="font-bold text-red-600 text-sm">حذف جميع البيانات</p>
                         <p className="text-[10px] text-red-400">إجراء لا يمكن التراجع عنه</p>
                     </div>
                 </div>
             </button>
             
             <div className="h-px bg-slate-100 mx-4 my-1"></div>

             <button 
               onClick={onLogout}
               className="w-full p-4 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors group"
             >
                 <div className="flex items-center gap-4">
                     <div className="bg-slate-100 p-2 rounded-full text-slate-500 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                         <LogOut className="w-5 h-5" />
                     </div>
                     <div className="text-right">
                         <p className="font-bold text-slate-700 text-sm">تسجيل الخروج</p>
                     </div>
                 </div>
             </button>
          </div>

          <p className="text-center text-[10px] text-slate-300 pt-4">الإصدار 1.0.5 - خلوتي</p>
      </div>

      {/* Confirmation Modal for PIN Reset */}
      {showConfirmModal && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                          <Lock className="w-5 h-5 text-purple-600" /> تأكيد الإجراء
                      </h3>
                      <button onClick={() => setShowConfirmModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  
                  <p className="text-sm text-slate-500 mb-6 font-bold text-center">
                      هل أنت متأكد من رغبتك في إعادة تعيين رمز نوتة الاعتراف؟<br/>
                      <span className="text-red-500 text-xs">سيتم حذف الرمز الحالي والسماح لك بإنشاء رمز جديد.</span>
                  </p>

                  <button 
                    onClick={handleResetPinConfirm}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700"
                  >
                      تأكيد إعادة التعيين
                  </button>
              </div>
          </div>
      )}

    </div>
  );
}