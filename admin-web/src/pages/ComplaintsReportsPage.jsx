import React, { useState } from 'react';
import api from '../services/api';
import { AlertTriangle, ShieldAlert, CheckCircle, Ban, Clock } from 'lucide-react';

export default function ComplaintsReportsPage({ reports, onRefresh }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (reportId, status, actionTaken) => {
    setLoading(true);
    try {
      await api.put(`/admin/reports/${reportId}/status`, {
        status,
        action_taken: actionTaken,
        admin_notes: actionNotes || 'Resolved by campus administration safety team.',
      });
      setSelectedReport(null);
      setActionNotes('');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId, currentBlocked) => {
    if (!confirm(`Are you sure you want to ${currentBlocked ? 'unblock' : 'suspend'} this student account?`)) return;
    try {
      await api.put(`/admin/users/${userId}/block`, {
        is_blocked: !currentBlocked,
        block_reason: !currentBlocked ? 'Safety protocol breach or complaint investigation' : null,
      });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Safety & Student Complaints Desk</h3>
          <p className="text-xs text-slate-500">Review unsafe driving reports, suspicious vehicle claims, and misconduct incidents</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-200">
          {reports?.length ?? 0} Safety Reports
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports && reports.length > 0 ? (
          reports.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-rose-100 text-rose-800">
                  {r.report_type.replace('_', ' ')}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : r.status === 'investigating'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700 animate-pulse'
                  }`}
                >
                  {r.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{r.reason}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{r.details}"
                </p>
              </div>

              <div className="text-xs space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reported Student:</span>
                  <span className="font-bold text-slate-900">{r.reported_user_id?.name || 'User'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student ID / Phone:</span>
                  <span className="font-mono text-slate-600">{r.reported_user_id?.student_id || r.reported_user_id?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Submitted By:</span>
                  <span className="text-slate-600">{r.reporter_id?.name || 'Anonymous Student'}</span>
                </div>
                {r.action_taken && (
                  <div className="mt-2 p-2 bg-emerald-50 text-emerald-800 text-[11px] rounded-lg border border-emerald-100">
                    <strong>Resolution:</strong> {r.action_taken}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    handleToggleBlock(
                      r.reported_user_id?._id,
                      r.reported_user_id?.is_blocked
                    )
                  }
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1 transition ${
                    r.reported_user_id?.is_blocked
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <Ban size={13} />
                  <span>{r.reported_user_id?.is_blocked ? 'Unblock User' : 'Suspend Account'}</span>
                </button>

                {r.status !== 'resolved' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        r._id,
                        'resolved',
                        'Investigation completed. Warning issued and logged in safety record.'
                      )
                    }
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Resolve Report
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400">
            No complaints or safety reports filed.
          </div>
        )}
      </div>
    </div>
  );
}
