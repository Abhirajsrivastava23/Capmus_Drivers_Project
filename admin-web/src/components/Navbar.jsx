import React from 'react';
import { Bell, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';

export default function Navbar({ onRefresh, isRefreshing, title, subtitle, onBackToWebsite }) {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onBackToWebsite && (
          <button
            onClick={onBackToWebsite}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 transition active:scale-95"
          >
            <ExternalLink size={13} className="text-zinc-700" />
            <span>Public Website</span>
          </button>
        )}

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-zinc-900' : 'text-zinc-600'} />
          <span>Refresh Data</span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-zinc-200 text-xs text-zinc-500 font-medium">
          <ShieldCheck size={16} className="text-zinc-800" />
          <span>System Status: <strong className="text-zinc-900">Online</strong></span>
        </div>
      </div>
    </header>
  );
}
