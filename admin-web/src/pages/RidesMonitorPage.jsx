import React, { useState } from 'react';
import { Route, MapPin, Calendar, Clock, IndianRupee, ShieldCheck } from 'lucide-react';

export default function RidesMonitorPage({ rides }) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRides = (rides || []).filter((r) => {
    if (statusFilter === 'all') return true;
    return r.ride_status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Campus Carpool Monitor</h3>
          <p className="text-xs text-slate-500">Monitor all scheduled, active, completed, and cancelled student journeys</p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'published', 'started', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Driver & ID</th>
                <th className="py-3.5 px-4">From → To</th>
                <th className="py-3.5 px-4">Pickup / Drop</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Seats</th>
                <th className="py-3.5 px-4">Cost Share</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRides.length > 0 ? (
                filteredRides.map((ride) => (
                  <tr key={ride._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {ride.driver_id?.name || 'Student Driver'}
                        {ride.driver_id?.verification_status === 'verified' && (
                          <span title="Verified Student">
                            <ShieldCheck size={14} className="text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{ride.driver_id?.student_id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div className="text-blue-700">{ride.destination}</div>
                      <div className="text-[10px] text-slate-400 font-normal">From: {ride.source}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="truncate max-w-[160px] font-medium">{ride.pickup_location}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">Drop: {ride.drop_location}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{ride.journey_date}</div>
                      <div className="text-[10px] text-blue-600 font-bold">{ride.departure_time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{ride.booked_seats} booked</span>
                      <span className="text-[10px] text-slate-400 block">{ride.available_seats} remaining</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{ride.cost_per_seat}
                      <span className="text-[10px] text-slate-400 font-sans block">/ seat</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-800 bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-300">
                        {ride.vehicle_id?.registration_number || 'UP32 AB 1234'}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{ride.vehicle_id?.vehicle_model}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ride.ride_status === 'published'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ride.ride_status === 'started'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                            : ride.ride_status === 'completed'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {ride.ride_status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No rides found for status: {statusFilter}
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
