import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Star, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';

const ReviewPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/transactions/${id}/`);
        setTransaction(res.data);
      } catch (e) {
        setError('Transaksi tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Pilih rating bintang terlebih dahulu.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await API.post(`/transactions/${id}/review/`, { rating, comment });
      setSuccess(true);
      setTimeout(() => navigate('/transactions'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Gagal mengirim ulasan.');
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'];

  if (loading) return (
    <div className="p-6 max-w-xl mx-auto animate-pulse space-y-4">
      <div className="h-5 bg-gray-100 rounded w-32" />
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Ulasan Terkirim!</h2>
        <p className="text-gray-400 text-sm">Terima kasih atas ulasanmu.</p>
      </div>
    </div>
  );

  const isBorrower = transaction?.borrower === user?.id;
  const revieweeName = isBorrower
    ? transaction?.listing_owner
    : transaction?.borrower_name;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition">
        <ChevronLeft size={16} /> Kembali
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Beri Ulasan</h1>
        <p className="text-sm text-gray-400 mt-1">
          Bagikan pengalamanmu dengan {revieweeName}
        </p>
      </div>

      {/* Info transaksi */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-5">
        <p className="text-sm font-semibold text-gray-800">{transaction?.listing_title}</p>
        <p className="text-xs text-gray-400 mt-1">
          {transaction?.start_date} → {transaction?.end_date} • {transaction?.duration_days} hari
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating bintang */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm font-medium text-gray-700 mb-4">
            Bagaimana pengalamanmu dengan <span className="text-blue-600">{revieweeName}</span>?
          </p>
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={36}
                  className={`transition-colors ${
                    star <= (hovered || rating)
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
          {(hovered || rating) > 0 && (
            <p className="text-sm font-medium text-amber-500">
              {starLabels[hovered || rating]}
            </p>
          )}
        </div>

        {/* Komentar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Ceritakan pengalamanmu (opsional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bagikan pengalamanmu agar pengguna lain bisa membuat keputusan yang tepat..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
          />
          <p className="text-xs text-gray-300 mt-1.5 text-right">{comment.length}/500</p>
        </div>

        <button type="submit" disabled={submitting || rating === 0}
          className="w-full bg-amber-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Star size={16} className="fill-current" /> Kirim Ulasan</>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewPage;