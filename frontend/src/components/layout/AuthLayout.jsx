import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import CampusLogo from '../../assets/CampusOpslogo.svg';

/**
 * Premium AuthLayout Component
 * Features a high-gloss interactive left panel and a clean, perfectly themed form area.
 */
export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="h-screen overflow-hidden flex bg-[var(--color-bg)] font-sans transition-colors duration-500">
      {/* Left Side: Premium Interactive Hero */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-950 p-16 flex-col justify-between relative overflow-hidden border-r border-white/5">
        {/* Animated Background Accents */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16 group cursor-default">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/10 shrink-0 group-hover:scale-110 transition-transform duration-500 p-1.5">
              <img src={CampusLogo} alt="CampusOps" className="w-full h-full object-contain" />
            </div>
            <div className="leading-none">
              <div className="text-white text-xl font-black tracking-tight">Smart Campus</div>
              <div className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1">Operations Hub</div>
            </div>
          </div>
          
          <div className="max-w-xl">
            <h1 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              The future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                campus operations.
              </span>
            </h1>
            <p className="text-slate-400 text-xl leading-relaxed font-medium mb-12 max-w-lg">
              Unlock peak efficiency with the industry's most advanced facility management ecosystem.
            </p>

            <div className="space-y-6">
              {[
                "Real-time resource governance",
                "Advanced maintenance orchestration",
                "Frictionless booking ecosystems"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-300 font-bold group">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                  </div>
                  <span className="text-lg">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md max-w-sm">
            <p className="text-slate-300 text-base italic font-medium leading-relaxed mb-4">
              "SmartHub didn't just organize our campus; it transformed how we interact with our infrastructure."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 shadow-lg" />
              <div>
                <div className="text-white text-sm font-black">Marcus Thorne</div>
                <div className="text-primary text-[10px] font-black uppercase tracking-widest">Director of Facilities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: High-Gloss Form Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Subtle background blob for right side */}
        <div className="absolute top-1/4 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-[460px] relative z-10">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 p-1.5">
                  <img src={CampusLogo} alt="CampusOps" className="w-full h-full object-contain" />
                </div>
                <div className="leading-none text-left">
                  <div className="text-sm font-black text-[var(--color-text)] tracking-tight">Smart Campus</div>
                  <div className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">Operations Hub</div>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-[var(--color-text)] mb-1 tracking-tight">{title}</h2>
            <p className="text-[var(--color-text-secondary)] font-bold text-xs uppercase tracking-tight opacity-60">
              {subtitle}
            </p>
          </div>
          
          <div className="glass-surface p-8 sm:p-10 rounded-[40px] border border-[var(--color-border)] shadow-premium animate-fade-in-up">
            {children}
          </div>
        </div>

        <footer className="absolute bottom-6 left-0 right-0 text-center text-[8px] text-[var(--color-muted)] font-black uppercase tracking-[0.2em] opacity-30">
          &copy; {new Date().getFullYear()} Campus Operations Hub &bull; v2.0
        </footer>
      </div>
    </div>
  );
}
