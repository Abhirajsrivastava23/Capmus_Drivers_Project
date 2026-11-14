import React from 'react';
import { Ticket, User, IndianRupee } from 'lucide-react';

export default function BookingsMonitorPage({ bookings }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Seat Bookings & Cost Sharing</h3>
          <p className="text-xs text-slate-500">Track all passenger requests, confirmed seats, and declared expense payments</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
          {bookings?.length ?? 0} Total Bookings
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Passenger</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Seats Reserved</th>
                <th className="py-3.5 px-4">Total Cost</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Booking Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings && bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.passenger_id?.name || 'Passenger'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.passenger_id?.student_id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{b.driver_id?.name || 'Driver'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.driver_id?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-blue-700">{b.ride_id?.destination || 'Destination'}</span>
                      <span className="block text-[10px] text-slate-400">{b.ride_id?.journey_date}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {b.seats_booked} seat(s)
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{b.total_cost}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.payment_status === 'upi_declared'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : b.payment_status === 'cash_declared'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {b.payment_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.booking_status === 'confirmed' || b.booking_status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.booking_status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : b.booking_status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {b.booking_status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No bookings recorded yet.
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
