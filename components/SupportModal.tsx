import React, { useState } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { sendSupportMessage } from '../lib/utils';

interface Props {
  username: string;
  onClose: () => void;
}

export default function SupportModal({ username, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    sendSupportMessage(username, message);
    setSent(true);
    setTimeout(() => {
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
           <h3 className="font-bold text-lg flex items-center gap-2">
             <MessageCircle className="w-5 h-5 text-blue-600" />
             الدعم الفني
           </h3>
           <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        {sent ? (
            <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-bold text-slate-800">تم الإرسال بنجاح</p>
                <p className="text-sm text-slate-500 mt-2">سنقوم بالرد عليك قريباً في الإشعارات.</p>
            </div>
        ) : (
            <>
                <p className="text-sm text-slate-500 mb-4">
                    هل واجهت مشكلة؟ أو لديك اقتراح؟ تواصل مع المطور مباشرة.
                </p>
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
                />
                <button 
                    onClick={handleSend}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                    <Send className="w-4 h-4" />
                    إرسال للمطور
                </button>
            </>
        )}
      </div>
    </div>
  );
}
