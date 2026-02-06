
import React, { useState } from 'react';
import { loginUser, registerUser, recoverPassword } from '../lib/utils';
import { Church, ArrowRight, Sparkles, Key, HelpCircle, Lock } from 'lucide-react';

interface Props {
  onLoginSuccess: (username: string) => void;
}

export default function AuthScreen({ onLoginSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
        setError("يرجى ملء جميع البيانات");
        return;
    }
    const res = registerUser(name.trim(), password, recoveryAnswer.trim());
    if (res.success) {
        onLoginSuccess(name.trim());
    } else {
        setError(res.message);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginUser(name.trim(), password);
    if (res.success) {
        onLoginSuccess(name.trim());
    } else {
        setError(res.message);
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
      e.preventDefault();
      const res = recoverPassword(name.trim(), recoveryAnswer.trim());
      if (res.success) {
          setSuccessMsg(`كلمة المرور الخاصة بك هي: ${res.password}`);
          setError(null);
          setTimeout(() => {
             setMode('login');
             setSuccessMsg(null);
             // Fill password automatically for convenience in this session
             if(res.password) setPassword(res.password);
          }, 5000);
      } else {
          setError(res.message);
          setSuccessMsg(null);
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
          
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-[60px] opacity-10 -mr-10 -mt-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400 rounded-full blur-[50px] opacity-20 -ml-5 -mb-5"></div>
        </div>

        <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
                {mode === 'login' ? 'تسجيل الدخول' : mode === 'register' ? 'إنشاء حساب جديد' : 'استعادة الحساب'}
            </h2>
            
            <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleRecovery} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 block mr-1">الاسم</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all text-slate-900 font-bold"
                        placeholder="اسم المستخدم"
                        autoFocus
                    />
                </div>

                {mode !== 'recover' && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 block mr-1">كلمة المرور</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all text-slate-900 font-bold"
                            placeholder="********"
                        />
                    </div>
                )}

                {(mode === 'register' || mode === 'recover') && (
                     <div className="space-y-2 animate-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-slate-500 block mr-1 flex items-center gap-1">
                             <HelpCircle className="w-3 h-3" /> سؤال الأمان: من هو شفيعك؟
                        </label>
                        <input 
                            type="text" 
                            value={recoveryAnswer}
                            onChange={(e) => setRecoveryAnswer(e.target.value)}
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all text-slate-900"
                            placeholder="مثال: مارجرجس"
                        />
                    </div>
                )}

                {error && <p className="text-xs text-red-500 font-bold text-center animate-bounce">{error}</p>}
                {successMsg && <p className="text-sm text-green-600 font-bold text-center bg-green-50 p-2 rounded-lg">{successMsg}</p>}

                <button 
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-200/50 transition-all active:scale-95 flex items-center justify-center gap-2 group mt-4"
                >
                    {mode === 'login' ? 'دخول' : mode === 'register' ? 'إنشاء حساب' : 'استعادة'}
                    {mode !== 'recover' && <ArrowRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />}
                </button>
            </form>

            <div className="flex justify-between items-center mt-6 text-xs font-bold text-slate-500">
                {mode === 'login' && (
                    <>
                        <button onClick={() => setMode('register')} className="text-blue-600 hover:underline">حساب جديد</button>
                        <button onClick={() => setMode('recover')} className="hover:text-slate-700">نسيت كلمة المرور؟</button>
                    </>
                )}
                {(mode === 'register' || mode === 'recover') && (
                    <button onClick={() => setMode('login')} className="w-full text-center text-blue-600 hover:underline">العودة لتسجيل الدخول</button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
