import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Star, CheckCircle, AlertCircle, ChevronLeft
} from 'lucide-react';

const Review = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await API.get(`/transactions/${id}/`);
        setTransaction(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Pilih rating bintang terlebih dahulu.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await API.post(`/transactions/${id}/review/`, {
        rating,
        comment,
      });
      setSuccess('Ulasan berhasil dikirim! Terima kasih.');
      setTimeout(() => navigate('/transactions'), 2500);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Gagal mengirim ulasan.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = transaction?.listing_owner_id === user?.id;
  const reviewTarget = isOwner
    ? transaction?.borrower_name
    : transaction?.listing_owner;

  if (loading) {
    return (
      <div className="p-6 max-w-xl mx-auto animate-pulse space-y-4">
        <div className="h-6 bg-gray-100 rounded w-32" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6 text-center">
        <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400">Transaksi tidak ditemukan</p>
      </div>
    );
  }

  if (transaction.status !== 'completed') {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <AlertCircle size={40} className="text-amber-400 mx-auto mb-3" />
        <p className="text-gray-700 font-medium">Transaksi belum selesai</p>
        <p className="text-gray-400 text-sm mt-1">
          Ulasan hanya bisa diberikan setelah transaksi selesai.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Ulasan Terkirim!</h2>
        <p className="text-gray-400 text-sm">{success}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-1">Beri Ulasan</h1>
      <p className="text-sm text-gray-400 mb-6">
        Bagikan pengalamanmu dengan {reviewTarget}
      </p>

      {/* Info Transaksi */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-5">
        <p className="text-sm font-semibold text-gray-800">{transaction.listing_title}</p>
        <p className="text-xs text-gray-400 mt-1">
          {isOwner ? `Dipinjam oleh: ${transaction.borrower_name}` : `Penyedia: ${transaction.listing_owner}`}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {transaction.start_date} → {transaction.end_date} ({transaction.duration_days} hari)
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Rating Bintang */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
            Beri Rating untuk {reviewTarget}
          </h3>
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={40}
                  className={`transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-current'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400">
            {rating === 0 && 'Pilih rating'}
            {rating === 1 && '⭐ Sangat Buruk'}
            {rating === 2 && '⭐⭐ Buruk'}
            {rating === 3 && '⭐⭐⭐ Cukup'}
            {rating === 4 && '⭐⭐⭐⭐ Bagus'}
            {rating === 5 && '⭐⭐⭐⭐⭐ Sangat Bagus!'}
          </p>
        </div>

        {/* Komentar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Komentar <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Ceritakan pengalamanmu dengan ${reviewTarget}...`}
            rows={4}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><Star size={16} /> Kirim Ulasan</>
          )}
        </button>
      </form>
    </div>
  );
};

export default Review;