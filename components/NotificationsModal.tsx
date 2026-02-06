import React from 'react';
import { AppNotification } from '../types';
import { Bell, CheckCircle, MessageSquare, X, Info } from 'lucide-react';
import { formatDateArabic } from '../lib/utils';

interface Props {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
}

export default function NotificationsModal({ notifications, onClose, onMarkRead }: Props) {
  // Sort by date desc
  const sorted = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
           <div className="flex items-center gap-2">
             <div className="bg-red-100 p-2 rounded-full text-red-500">
               <Bell className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-lg text-slate-800">الإشعارات</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
           {sorted.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <Bell className="w-12 h-12 mb-2 opacity-20" />
               <p>لا توجد إشعارات حالياً</p>
             </div>
           ) : (
             <div className="space-y-2">
               {sorted.map(notif => (
                 <div 
                   key={notif.id} 
                   onClick={() => onMarkRead(notif.id)}
                   className={`p-4 rounded-xl cursor-pointer border transition-all relative ${
                     notif.read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100'
                   }`}
                 >
                   {!notif.read && (
                     <span className="absolute top-4 left-4 w-2 h-2 bg-blue-500 rounded-full"></span>
                   )}
                   
                   <div className="flex items-start gap-3">
                      <div className={`mt-1 p-2 rounded-full shrink-0 ${
                        notif.type === 'admin' ? 'bg-purple-100 text-purple-600' :
                        notif.type === 'system' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {notif.type === 'admin' ? <MessageSquare className="w-4 h-4" /> : 
                         notif.type === 'system' ? <Info className="w-4 h-4" /> : 
                         <Bell className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h4 className="font-bold text-slate-800 text-sm mb-1">{notif.title}</h4>
                           <span className="text-[10px] text-slate-400">{formatDateArabic(notif.date)}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
