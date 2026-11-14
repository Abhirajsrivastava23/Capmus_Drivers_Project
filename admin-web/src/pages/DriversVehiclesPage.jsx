import React from 'react';
import api from '../services/api';
import { Car, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

export default function DriversVehiclesPage({ vehicles, onRefresh }) {
  const handleVerifyVehicle = async (vehicleId, status) => {
    try {
      await api.put(`/admin/vehicles/${vehicleId}/verify`, { verification_status: status });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update vehicle');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Registered Student Vehicles</h3>
          <p className="text-xs text-slate-500">Verify UP registration numbers, vehicle models, and personal car ownership</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
          {vehicles?.length ?? 0} Vehicles Registered
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles && vehicles.length > 0 ? (
          vehicles.map((v) => (
            <div key={v._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    {v.vehicle_type || 'Car'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">{v.vehicle_model}</h4>
                  <p className="text-xs text-slate-500 font-medium">Colour: {v.colour}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Car size={20} />
                </div>
              </div>

              {/* Number Plate Graphic */}
              <div className="px-3 py-1.5 bg-yellow-400 text-slate-900 font-mono font-black text-center text-sm tracking-wider rounded-lg border-2 border-slate-900 shadow-sm flex items-center justify-center gap-2">
                <span className="text-[9px] font-sans font-bold bg-blue-900 text-white px-1 py-0.5 rounded">IND</span>
                <span>{v.registration_number}</span>
              </div>

              <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner Student:</span>
                  <span className="font-semibold text-slate-800">{v.owner_id?.name || 'Student'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Roll / ID:</span>
                  <span className="font-mono text-slate-700">{v.owner_id?.student_id || 'CUUP'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Air Conditioning:</span>
                  <span className={`font-semibold ${v.ac_available ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {v.ac_available ? 'AC Equipped' : 'Non-AC'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Luggage Space:</span>
                  <span className="font-medium text-slate-700">{v.luggage_capacity}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.verification_status === 'verified'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {v.verification_status.toUpperCase()}
                </span>

                <div className="flex items-center gap-2">
                  {v.verification_status !== 'verified' && (
                    <button
                      onClick={() => handleVerifyVehicle(v._id, 'verified')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg transition"
                    >
                      Approve
                    </button>
                  )}
                  {v.verification_status !== 'rejected' && (
                    <button
                      onClick={() => handleVerifyVehicle(v._id, 'rejected')}
                      className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold rounded-lg border border-rose-200 transition"
                    >
                      Decline
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400">
            No student vehicles currently registered.
          </div>
        )}
      </div>
    </div>
  );
}
