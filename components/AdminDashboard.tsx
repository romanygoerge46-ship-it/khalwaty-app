import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Clock, XCircle, RefreshCw, Send, Lock, Users, MessageSquare, Trash2, TrendingUp, DollarSign, Activity, Search, Calendar, ChevronDown } from 'lucide-react';
import { formatDateArabic, getAllUsers, sendNotification } from '../lib/utils';
import { DonationRequest, SupportMessage } from '../types';

interface Props {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'users' | 'support'>('overview');
  
  // Data
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  
  // Messaging State
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null); 
  const [noteText, setNoteText] = useState("");
  const [messageTargetUser, setMessageTargetUser] = useState<string | null>(null); 
  const [messageText, setMessageText] = useState("");
  const [replyText, setReplyText] = useState("");

  const loadData = () => {
    const sharedData = JSON.parse(localStorage.getItem('ruhi_admin_shared_data') || '{"requests": [], "support": []}');
    const sortedRequests = (sharedData.requests as DonationRequest[]).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const sortedSupport = (sharedData.support as SupportMessage[] || []).sort((a, b) => 
       new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setRequests(sortedRequests);
    setSupportMessages(sortedSupport);
    setUsers(getAllUsers());
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "0000") {
      setIsAuthenticated(true);
    } else {
      alert("كلمة المرور غير صحيحة");
      setPassword("");
    }
  };

  const updateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus, adminNote: noteText } : r);
    setRequests(updated);
    
    const sharedData = JSON.parse(localStorage.getItem('ruhi_admin_shared_data') || '{}');
    sharedData.requests = updated;
    localStorage.setItem('ruhi_admin_shared_data', JSON.stringify(sharedData));
    
    sendNotification(request.username, {
      id: Date.now().toString(),
      type: 'system',
      title: newStatus === 'approved' ? 'تم تفعيل إزالة الإعلانات' : 'تحديث بخصوص طلبك',
      message: newStatus === 'approved' 
        ? 'شكراً لدعمك! تم قبول طلبك وإزالة الإعلانات بنجاح.' 
        : `عذراً، تم رفض طلبك. ملاحظة: ${noteText || 'يرجى مراجعة البيانات'}`,
      date: new Date().toISOString(),
      read: false
    });

    setActiveNoteId(null);
    setNoteText("");
  };

  const handleReplySupport = (msg: SupportMessage) => {
      if(!replyText.trim()) return;

      sendNotification(msg.username, {
          id: Date.now().toString(),
          type: 'admin',
          title: 'رد على رسالتك',
          message: `بخصوص: "${msg.message.substring(0, 20)}..." \n\n الرد: ${replyText}`,
          date: new Date().toISOString(),
          read: false
      });
      
      alert("تم إرسال الرد");
      setReplyText("");
      // Update local state to mark loosely as replied if we had such a flag
  };

  const handleSendMessage = () => {
    if (!messageTargetUser || !messageText.trim()) return;
    sendNotification(messageTargetUser, {
      id: Date.now().toString(),
      type: 'admin',
      title: 'رسالة من الإدارة',
      message: messageText,
      date: new Date().toISOString(),
      read: false
    });
    alert("تم إرسال الرسالة بنجاح");
    setMessageText("");
    setMessageTargetUser(null);
  };

  const handleDeleteUser = (username: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم ${username}؟`)) {
      setUsers(users.filter(u => u !== username));
      // In a real app, we would also clear their data from localStorage
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 font-[Cairo]">
        <div className="bg-white w-full max-w-sm p-8 md:p-10 rounded-3xl shadow-2xl text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <Lock className="w-8 h-8 md:w-10 md:h-10 text-slate-800" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-slate-800">لوحة المطور</h2>
          <p className="text-slate-500 mb-6 text-sm md:text-base">يرجى إدخال رمز الدخول للمتابعة</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-center text-2xl md:text-3xl font-bold tracking-widest p-4 border-2 border-slate-200 rounded-2xl mb-6 focus:border-slate-800 focus:outline-none transition-colors"
              placeholder="••••"
              autoFocus
            />
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">دخول</button>
            <button type="button" onClick={onBack} className="mt-6 text-sm text-slate-400 font-bold hover:text-slate-600 block w-full">عودة للتطبيق</button>
          </form>
        </div>
      </div>
    );
  }

  // Statistics
  const totalRevenue = requests.filter(r => r.status === 'approved').reduce((acc, curr) => acc + parseInt(curr.amount || '0'), 0);
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const totalSupport = supportMessages.length;
  const unreadSupport = supportMessages.filter(m => !m.read).length; // Simulated read status

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-[Cairo] flex flex-col text-slate-900">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
         <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors">
                 <ArrowRight className="w-5 h-5 text-slate-600" />
             </button>
             <h2 className="text-lg md:text-xl font-bold text-slate-800">لوحة القيادة</h2>
         </div>
         <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-bold text-xs shadow-md">
             <RefreshCw className="w-3 h-3" />
             <span className="hidden sm:inline">تحديث</span>
         </button>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
         {/* Sidebar (Desktop Only) */}
         <aside className="w-64 bg-white border-l border-slate-200 hidden md:block p-4 space-y-2 shadow-sm z-20 h-full overflow-y-auto shrink-0">
             {[
               { id: 'overview', icon: Activity, label: 'نظرة عامة' },
               { id: 'requests', icon: DollarSign, label: 'التبرعات' },
               { id: 'users', icon: Users, label: 'المستخدمين' },
               { id: 'support', icon: MessageSquare, label: 'الرسائل' }
             ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === item.id ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                </button>
             ))}
         </aside>

         {/* Mobile Bottom Nav */}
         <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-40 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
            {[
              { id: 'overview', icon: Activity },
              { id: 'requests', icon: DollarSign },
              { id: 'users', icon: Users },
              { id: 'support', icon: MessageSquare }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)} 
                className={`p-3 rounded-2xl ${activeTab === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
              >
                <item.icon className="w-6 h-6" />
              </button>
            ))}
         </div>

         {/* Content Area */}
         <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-10 bg-[#f8fafc]">
            
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "المستخدمين", val: users.length, icon: Users, color: "text-slate-600", bg: "bg-slate-50" },
                      { label: "الدخل الكلي", val: `${totalRevenue} ج.م`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
                      { label: "طلبات معلقة", val: pendingRequests, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
                      { label: "رسائل الدعم", val: totalSupport, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                          <div className="flex items-center gap-2 mb-2">
                             <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}><stat.icon className="w-5 h-5"/></div>
                             <span className="text-slate-500 font-bold text-sm">{stat.label}</span>
                          </div>
                          <p className={`text-3xl font-bold ${stat.color}`}>{stat.val}</p>
                      </div>
                    ))}
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-xl text-slate-800">سجل التبرعات ({requests.length})</h3>
                        <p className="text-sm text-slate-500 mt-1">إدارة طلبات إزالة الإعلانات والتحويلات المالية</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {requests.length === 0 ? <p className="text-center text-slate-400 py-10 font-bold">لا توجد طلبات حالياً</p> : 
                         requests.map(req => (
                            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-blue-200 transition-all">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                            req.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                            req.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg text-slate-900">{req.username}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                    req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                                    req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {req.status === 'approved' ? 'مقبول' : req.status === 'pending' ? 'في الانتظار' : 'مرفوض'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs font-bold">
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded border border-slate-200">Ref: {req.transactionRef}</span>
                                                <span className="bg-green-50 text-green-700 px-3 py-1 rounded border border-green-100">{req.amount} ج.م</span>
                                                <span className="flex items-center gap-1 text-slate-400 font-medium ml-2"><Calendar className="w-3 h-3"/> {formatDateArabic(req.date)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {req.status === 'pending' ? (
                                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <input 
                                                className="border border-slate-200 p-3 rounded-xl text-sm w-full sm:w-64 bg-white focus:outline-none focus:border-blue-500 transition-colors" 
                                                placeholder="ملاحظة للإدارة (سبب الرفض مثلاً)..."
                                                value={activeNoteId === req.id ? noteText : ""} 
                                                onChange={e => { setActiveNoteId(req.id); setNoteText(e.target.value); }} 
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => updateStatus(req.id, 'approved')} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                                    <CheckCircle className="w-4 h-4" /> قبول
                                                </button>
                                                <button onClick={() => updateStatus(req.id, 'rejected')} className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                                    <XCircle className="w-4 h-4" /> رفض
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-left px-4">
                                            <span className={`text-sm font-bold ${req.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                                {req.status === 'approved' ? 'تمت العملية بنجاح ✅' : 'تم رفض العملية ❌'}
                                            </span>
                                            {req.adminNote && <p className="text-xs text-slate-400 mt-1">ملاحظة: {req.adminNote}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">قائمة المستخدمين</h3>
                        <div className="relative">
                             <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                             <input type="text" placeholder="بحث..." className="pr-9 pl-3 py-2 text-sm border border-slate-200 rounded-lg w-40 md:w-64 focus:outline-none focus:border-blue-500" />
                        </div>
                    </div>
                    
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                         {users.map(user => (
                             <div key={user} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-white flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                                         {user.charAt(0).toUpperCase()}
                                     </div>
                                     <div className="overflow-hidden">
                                         <p className="font-bold text-slate-800 truncate max-w-[120px]" title={user}>{user}</p>
                                         <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">نشط</span>
                                     </div>
                                 </div>
                                 <div className="flex gap-1">
                                     <button onClick={() => { setMessageTargetUser(user); setMessageText(""); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><MessageSquare className="w-4 h-4"/></button>
                                     <button onClick={() => handleDeleteUser(user)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                                 </div>
                             </div>
                         ))}
                    </div>

                    {/* Quick Message Modal */}
                    {messageTargetUser && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-in zoom-in-95">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold">إرسال رسالة لـ {messageTargetUser}</h3>
                                    <button onClick={() => setMessageTargetUser(null)}><XCircle className="w-6 h-6 text-slate-400"/></button>
                                </div>
                                <textarea 
                                    className="w-full border p-3 rounded-xl mb-4 bg-slate-50 min-h-[100px]" 
                                    placeholder="نص الرسالة..."
                                    value={messageText}
                                    onChange={e => setMessageText(e.target.value)}
                                />
                                <button onClick={handleSendMessage} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" /> إرسال
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'support' && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-800">رسائل الدعم ({supportMessages.length})</h3>
                        <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                            {supportMessages.length} رسالة
                        </span>
                    </div>

                    {supportMessages.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
                             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-10 h-10 text-slate-300" />
                             </div>
                             <p className="text-slate-500 font-bold text-lg">صندوق الوارد فارغ</p>
                             <p className="text-slate-400 mt-2">لا توجد رسائل دعم فني جديدة.</p>
                        </div>
                    ) : (
                        supportMessages.map(msg => (
                            <div key={msg.id} className={`bg-white rounded-3xl border shadow-sm transition-all overflow-hidden ${!msg.read ? 'border-blue-200 shadow-blue-50 ring-1 ring-blue-100' : 'border-slate-200'}`}>
                                
                                {/* Message Header */}
                                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm">
                                            {msg.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                {msg.username}
                                                {!msg.read && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
                                            </p>
                                            <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {formatDateArabic(msg.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 font-bold bg-white px-3 py-1 rounded-full border border-slate-100">
                                        ID: {msg.id.slice(-4)}
                                    </div>
                                </div>

                                {/* Message Body & Reply */}
                                <div className="p-6">
                                    <div className="bg-slate-50 p-5 rounded-2xl text-slate-800 text-base leading-loose border border-slate-100 mb-6 font-medium relative">
                                        <MessageSquare className="w-10 h-10 text-slate-200 absolute -top-2 -right-2 opacity-50" />
                                        "{msg.message}"
                                    </div>

                                    <div className="flex flex-col gap-3 pt-2 border-t border-slate-50">
                                         <label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                            <Send className="w-3 h-3" /> الرد على المستخدم:
                                         </label>
                                         <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                                            <textarea 
                                                className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none resize-none h-28 sm:h-auto transition-all"
                                                placeholder="اكتب ردك هنا..."
                                                value={activeNoteId === msg.id ? replyText : ""}
                                                onChange={e => {
                                                    setActiveNoteId(msg.id);
                                                    setReplyText(e.target.value);
                                                }}
                                            />
                                            <button 
                                                onClick={() => handleReplySupport(msg)} 
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm sm:w-32 flex sm:flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-200"
                                            >
                                                <Send className="w-5 h-5" />
                                                إرسال
                                            </button>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

         </main>
      </div>
    </div>
  );
}