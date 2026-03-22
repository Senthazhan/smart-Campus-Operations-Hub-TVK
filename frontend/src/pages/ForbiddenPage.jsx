import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-red-100/50 border border-red-100 rotate-3 group hover:rotate-0 transition-transform duration-500">
        <ShieldAlert className="w-12 h-12" />
      </div>
      
      <div className="space-y-4 max-w-md">
        <h2 className="text-4xl font-black tracking-tighter text-slate-900">Access Denied</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          Your credentials do not permit entry to this sector. If you believe this is a system error, please contact your administrator.
        </p>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Link to="/">
          <Button className="gap-2 bg-slate-900 shadow-xl shadow-slate-200 font-bold uppercase tracking-widest text-xs px-8 py-6 rounded-2xl">
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
        <Button variant="secondary" onClick={() => window.history.back()} className="gap-2 bg-white border-slate-200 font-bold uppercase tracking-widest text-xs px-8 py-6 rounded-2xl">
          <ArrowLeft className="w-4 h-4" />
          Retreat
        </Button>
      </div>
      
      <div className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
        Error Code: 403_Insufficient_Permissions
      </div>
    </div>
  );
}

