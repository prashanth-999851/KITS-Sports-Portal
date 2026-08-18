import React from 'react';
import { Home, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b2e5b] text-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">Error 404 • Page Not Found</span>
          <h1 className="text-3xl font-extrabold text-white">Lost in the Stadium?</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page or resource you are looking for does not exist or has been moved to a new section of the KITS Sports Portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold bg-[#0d3a73] hover:bg-[#104a8e] text-white flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Public Homepage</span>
          </button>
        </div>
      </div>
    </div>
  );
}
