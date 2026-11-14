import React, { useState } from 'react';
import api from '../services/api';
import { Star, ShieldAlert, EyeOff, Eye, CheckCircle } from 'lucide-react';

export default function ReviewsModerationPage({ reviews, onRefresh }) {
  const [filter, setFilter] = useState('all'); // 'all', 'flagged', 'hidden'

  const handleToggleHide = async (reviewId, isCurrentlyHidden) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/moderate`, { is_hidden: !isCurrentlyHidden });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to moderate review');
    }
  };

  const filteredReviews = (reviews || []).filter((r) => {
    if (filter === 'flagged') return r.is_reported;
    if (filter === 'hidden') return r.is_hidden;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Driving Experience Reviews & Ratings</h3>
          <p className="text-xs text-slate-500">Monitor 5-star passenger ratings, detect fake or abusive feedback, and maintain driver integrity</p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'flagged', 'hidden'].map((f) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <div
              key={rev._id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                rev.is_hidden ? 'border-slate-300 opacity-60 bg-slate-50' : 'border-slate-200/80 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={s <= rev.overall_rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                      />
                    ))}
                    <span className="text-sm font-bold text-slate-900 ml-1.5">{rev.overall_rating}.0</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Journey to <strong className="text-blue-700">{rev.ride_id?.destination || 'Destination'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {rev.is_reported && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                      <ShieldAlert size={12} /> Flagged
                    </span>
                  )}
                  {rev.is_hidden && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* 5-Star Breakdown Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Safety</span>
                  <strong className="text-slate-800 text-xs">{rev.safety_rating} ★</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Behaviour</span>
                  <strong className="text-slate-800 text-xs">{rev.behaviour_rating} ★</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Punctuality</span>
                  <strong className="text-slate-800 text-xs">{rev.punctuality_rating} ★</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Communication</span>
                  <strong className="text-slate-800 text-xs">{rev.communication_rating} ★</strong>
                </div>
              </div>

              <p className="text-xs text-slate-700 italic bg-blue-50/40 p-3 rounded-xl border border-blue-100/60 leading-relaxed">
                "{rev.review_text || 'No additional written feedback provided.'}"
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">
                  By <strong>{rev.passenger_id?.name || 'Verified Student'}</strong> for driver <strong>{rev.driver_id?.name}</strong>
                </span>

                <button
                  onClick={() => handleToggleHide(rev._id, rev.is_hidden)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    rev.is_hidden
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  {rev.is_hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                  <span>{rev.is_hidden ? 'Restore Review' : 'Hide Review'}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-400">
            No reviews match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
