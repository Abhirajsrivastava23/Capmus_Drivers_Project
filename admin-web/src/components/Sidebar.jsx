import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Car,
  Route,
  Ticket,
  AlertTriangle,
  Star,
  FileText,
  LogOut,
  Users,
  Globe
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Sidebar({ activeTab, setActiveTab, onBackToWebsite }) {
  const { logout, admin } = useAdminAuth();

  const menuItems = [
    { id: 'overview', label: 'Overview & Metrics', icon: LayoutDashboard },
    { id: 'students', label: 'Student ID Verification', icon: ShieldCheck, badge: 'Live' },
    { id: 'vehicles', label: 'Drivers & Vehicles', icon: Car },
    { id: 'rides', label: 'Rides Monitor', icon: Route },
    { id: 'bookings', label: 'Bookings & Seats', icon: Ticket },
    { id: 'reports', label: 'Safety & Complaints', icon: AlertTriangle, dangerBadge: true },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
    { id: 'audit', label: 'Security Audit Logs', icon: FileText },
  ];

  return (
    <aside className="w-72 bg-[#0B0C10] text-zinc-300 flex flex-col h-screen fixed left-0 top-0 border-r border-zinc-800/80 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-zinc-700/80 bg-black flex items-center justify-center shadow-lg shadow-black/50 shrink-0">
            <img
              src="/assets/campus_f1_square.png"
              alt="Campus Drivers Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">Campus Drivers</h1>
            <p className="text-xs text-zinc-400 font-medium">Chandigarh University UP</p>
          </div>
        </div>
        <div className="mt-4 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-700/60 flex items-center justify-between text-xs text-zinc-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse"></span>
            Admin Portal
          </span>
          <span className="font-mono text-[10px] text-zinc-500">Lucknow Campus</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-zinc-950 font-bold shadow-md shadow-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-zinc-950' : 'text-zinc-400'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  isActive
                    ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Back to Public Website CTA */}
      {onBackToWebsite && (
        <div className="px-4 py-2 border-t border-zinc-850">
          <button
            onClick={onBackToWebsite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 transition shadow-sm"
          >
            <Globe size={15} className="text-zinc-400" />
            <span>Public Website & APK</span>
          </button>
        </div>
      )}

      {/* Admin Profile & Logout */}
      <div className="p-4 border-t border-zinc-800/80 bg-[#07080A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-semibold text-sm">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{admin?.name || 'Administrator'}</p>
              <p className="text-xs text-zinc-400 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
