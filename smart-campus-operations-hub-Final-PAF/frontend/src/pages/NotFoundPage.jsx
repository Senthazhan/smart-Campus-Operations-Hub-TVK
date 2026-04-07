import React from 'react';
import { Link } from 'react-router-dom';
import { SearchSlash, Home, Ghost } from 'lucide-react';
import { Button } from '../components/common/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-12">
        <div className="w-32 h-32 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-100/50 border border-blue-100 transform -rotate-6">
          <Ghost className="w-16 h-16 animate-bounce" />
        </div>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center text-slate-400 transform rotate-12">
           <SearchSlash className="w-8 h-8" />
        </div>
      </div>
      
      <div className="space-y-4 max-w-md">
        <h2 className="text-5xl font-black tracking-tighter text-slate-900">404</h2>
        <h3 className="text-xl font-bold text-slate-800">Coordinates Not Found</h3>
        <p className="text-slate-500 font-medium leading-relaxed">
          The sector you are trying to reach has been relocated or doesn't exist in our current campus matrix.
        </p>
      </div>

      <div className="mt-12">
        <Link to="/">
          <Button className="gap-2 bg-slate-900 shadow-xl shadow-slate-200 font-black uppercase tracking-[0.2em] text-xs px-10 py-7 rounded-3xl group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Return to Base
          </Button>
        </Link>
      </div>
      
      <div className="mt-16 flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
         <span className="w-8 h-px bg-slate-200" />
         Status: Page_Decommissioned
         <span className="w-8 h-px bg-slate-200" />
      </div>
    </div>
  );
}

