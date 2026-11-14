import React, { useState } from 'react';
import api from '../services/api';
import { ShieldCheck, ShieldAlert, CheckCircle, XCircle, Search, Eye } from 'lucide-react';

export default function StudentVerificationPage({ students, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleVerify = async (studentId, status) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/students/${studentId}/verify`, {
        status,
        notes: reviewNote || (status === 'approved' ? 'Verified Chandigarh University student' : 'ID unreadable or invalid'),
      });
      setSelectedStudent(null);
      setReviewNote('');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update verification status');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStudents = (students || []).filter((s) => {
    const matchesFilter = filter === 'all' || s.verification_status === filter;
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by student name, ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'pending', 'verified', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Student Details</th>
                <th className="py-3.5 px-4">University ID</th>
                <th className="py-3.5 px-4">Course & Semester</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-400">{student.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 bg-blue-50/50 px-2 rounded">
                      {student.student_id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {student.course}
                      <span className="block text-[10px] text-slate-400">{student.semester}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {student.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          student.verification_status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.verification_status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {student.verification_status === 'verified' && <CheckCircle size={12} />}
                        {student.verification_status === 'pending' && <ShieldAlert size={12} />}
                        {student.verification_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition inline-flex items-center gap-1.5"
                      >
                        <Eye size={14} />
                        <span>Inspect ID</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No students match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={20} />
                Student ID Verification
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">University Roll / ID</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{selectedStudent.student_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Course & Semester</span>
                  <span className="font-medium text-slate-800">{selectedStudent.course} ({selectedStudent.semester})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-mono text-slate-700">{selectedStudent.phone}</span>
                </div>
              </div>

              {/* ID Card Graphic / Preview */}
              <div className="rounded-2xl border-2 border-dashed border-blue-200 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
                <p className="text-[11px] font-bold text-blue-900 mb-2">Chandigarh University Student Identity Card</p>
                <div className="w-full h-36 rounded-xl bg-white shadow-inner flex flex-col items-center justify-center p-4 border border-blue-100">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg mb-2 shadow">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <p className="font-bold text-slate-800 text-xs">{selectedStudent.name}</p>
                  <p className="font-mono text-[11px] text-blue-600 font-semibold">{selectedStudent.student_id}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{selectedStudent.course} • Lucknow Campus</p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Admin Verification Notes
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Valid student identity confirmed in university database."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                disabled={actionLoading}
                onClick={() => handleVerify(selectedStudent._id, 'rejected')}
                className="flex-1 py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 text-xs transition flex items-center justify-center gap-1.5"
              >
                <XCircle size={16} />
                <span>Reject ID</span>
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleVerify(selectedStudent._id, 'approved')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <CheckCircle size={16} />
                <span>Approve & Verify Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
