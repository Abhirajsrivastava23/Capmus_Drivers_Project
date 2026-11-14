import React from 'react';
import StatCard from '../components/StatCard';
import { Users, ShieldCheck, Car, Route, Ticket, AlertTriangle, Star, CheckCircle, Clock } from 'lucide-react';

export default function DashboardOverview({ metrics, recentRides, recentReports, setActiveTab }) {
  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Verified Students"
          value={metrics?.verifiedStudents ?? 0}
          subtitle={`Out of ${metrics?.totalStudents ?? 0} registered`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending ID Reviews"
          value={metrics?.pendingVerifications ?? 0}
          subtitle="Awaiting admin clearance"
          icon={ShieldCheck}
          color="amber"
        />
        <StatCard
          title="Active Carpool Rides"
          value={metrics?.activeRides ?? 0}
          subtitle={`${metrics?.totalRides ?? 0} rides published total`}
          icon={Route}
          color="emerald"
        />
        <StatCard
          title="Open Safety Reports"
          value={metrics?.pendingReports ?? 0}
          subtitle="Complaints / vehicle checks"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Rides Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Campus Rides</h3>
              <p className="text-xs text-slate-500">Live monitoring of rides from Chandigarh University UP</p>
            </div>
            <button
              onClick={() => setActiveTab('rides')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All Rides →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Driver</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRides && recentRides.length > 0 ? (
                  recentRides.map((ride) => (
                    <tr key={ride._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-medium text-slate-900">
                        {ride.driver_id?.name || 'Student Driver'}
                        <span className="block text-[10px] text-slate-400">{ride.driver_id?.student_id}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {ride.destination}
                        <span className="block text-[10px] text-slate-400 truncate max-w-[150px]">{ride.pickup_location}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-700 font-medium">{ride.vehicle_id?.registration_number || 'UP32 AB 1234'}</span>
                        <span className="block text-[10px] text-slate-400">{ride.vehicle_id?.vehicle_model}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {ride.journey_date}
                        <span className="block text-[10px] text-blue-600 font-medium">{ride.departure_time}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No rides published yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Safety / Complaints Widget */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Safety Alerts</h3>
                <p className="text-xs text-slate-500">Student reports & inquiries</p>
              </div>
              <button
                onClick={() => setActiveTab('reports')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Inspect →
              </button>
            </div>

            <div className="space-y-3">
              {recentReports && recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <div key={report._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 uppercase text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                        {report.report_type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{report.status}</span>
                    </div>
                    <p className="font-semibold text-slate-800">{report.reason}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{report.details}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <CheckCircle size={24} className="mx-auto text-emerald-500 mb-2" />
                  No open complaints. Campus carpooling operates smoothly!
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
            <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
              <span>🛡️ Campus Safety Policy</span>
            </h4>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              Only verified Chandigarh University students can offer or book seats. Drivers must have valid UP-registered personal cars and verified student IDs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
