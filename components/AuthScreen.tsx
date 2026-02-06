import React, { useState } from 'react';
import { loginUser, registerUser } from '../lib/utils';
import { Church, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onLoginSuccess: (username: string) => void;
}

export default function AuthScreen({ onLoginSuccess }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        setError("من فضلك اكتب اسمك");
        return;
    }

    // Direct entry logic
    // We try to register; if it exists, we just login.
    // Since it's local device, names don't need to be unique globally, just acting as a profile ID.
    const regResult = registerUser(name.trim());
    if (regResult.success || regResult.message === "رقم الهاتف مسجل بالفعل") { // Reusing message logic roughly
        loginUser(name.trim());
        onLoginSuccess(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-[Cairo]">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
        
        {/* Aesthetic Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner border border-white/20">
                 <Church className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">خلوتي</h1>
            <p className="text-blue-100 text-sm font-medium opacity-90">مخدعك السري للصلاة والتأمل</p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-[60px] opacity-10 -mr-10 -mt-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400 rounded-full blur-[50px] opacity-20 -ml-5 -mb-5"></div>
        </div>

        <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">أهلاً بك 👋</h2>
            <p className="text-slate-500 text-center text-sm mb-8">سجل اسمك لتبدأ رحلتك الروحية</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 block mr-1">الاسم</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:outline-none transition-all text-slate-900 font-bold placeholder:text-slate-300 text-lg text-center"
                        placeholder="اكتب اسمك هنا..."
                        autoFocus
                    />
                </div>

                {error && (
                    <p className="text-xs text-red-500 font-bold text-center animate-bounce">{error}</p>
                )}

                <button 
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200/50 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                    <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                    ابـدأ الـرحلـة
                    <ArrowRight className="w-5 h-5" />
                </button>
            </form>

            <p className="text-[10px] text-slate-300 text-center mt-8">
                نسخة خالية من التعقيد، لتركز في صلاتك فقط.
            </p>
        </div>
      </div>
    </div>
  );
}