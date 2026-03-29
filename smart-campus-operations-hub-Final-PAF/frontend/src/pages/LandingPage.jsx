import React from 'react';
import { loginWithGoogle } from '../api/authApi';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/common/Button';
import { LogIn, BookOpen, ShieldCheck, Activity } from 'lucide-react';

export function LandingPage() {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your credentials to manage campus operations"
    >
      <div className="space-y-6">
        <Button
          onClick={loginWithGoogle}
          className="w-full py-6 rounded-2xl gap-3 text-sm font-black uppercase tracking-widest bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-100/50 transition-all border-none"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sync with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm uppercase">
            <span className="bg-white px-2 text-slate-500 font-bold tracking-widest text-[10px]">Developer Access</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <a
            href="/swagger"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            Core API Documentation
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
           <div className="flex flex-col gap-1">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg self-start">
                 <ShieldCheck className="w-4 h-4" />
              </div>
               <div className="text-xs font-bold text-slate-900 mt-1">Role-Based</div>
               <p className="text-[10px] text-slate-600 leading-tight font-medium">Secure access for Admin & Technicians.</p>
            </div>
            <div className="flex flex-col gap-1">
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg self-start">
                  <Activity className="w-4 h-4" />
               </div>
               <div className="text-xs font-bold text-slate-900 mt-1">Real-time</div>
               <p className="text-[10px] text-slate-600 leading-tight font-medium">Live tracking of campus maintenance.</p>
           </div>
        </div>
      </div>
    </AuthLayout>
  );
}

