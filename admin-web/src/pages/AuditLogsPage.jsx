import React from 'react';
import { FileText, Shield, Clock } from 'lucide-react';

export default function AuditLogsPage({ logs }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Security Audit Logs</h3>
          <p className="text-xs text-slate-500">Immutable forensic audit trail of all administrative actions, logins, and safety updates</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
          {logs?.length ?? 0} Audit Events
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Performed By</th>
                <th className="py-3.5 px-4">Details / Metadata</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id.slice(-6)})` : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{log.user_id?.name || 'System / Guest'}</div>
                      <span className="text-[10px] text-slate-400">{log.user_id?.role || 'Guest'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
