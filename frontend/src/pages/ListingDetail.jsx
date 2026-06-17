import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  MapPin, Star, ChevronLeft, Calendar, Shield,
  User, Package, ChevronRight, AlertCircle, CheckCircle
} from 'lucide-react';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await API.get(`/listings/${id}/`);
        setListing(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const today = new Date().toISOString().split('T')[0];

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate) - new Date(startDate);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const days = calculateDays();
  const totalRent = days * parseFloat(listing?.price_per_day || 0);
  const platformFee = totalRent * 0.1;
  const totalPayment = totalRent + parseFloat(listing?.deposit_amount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startDate || !endDate) {
      setError('Pilih tanggal mulai dan selesai peminjaman.');
      return;
    }
    if (days <= 0) {
      setError('Tanggal selesai harus setelah tanggal mulai.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/transactions/', {
        listing: listing.id,
        start_date: startDate,
        end_date: endDate,
      });
      setSuccess('Pengajuan berhasil dikirim! Menunggu konfirmasi penyedia.');
      setTimeout(() => navigate('/transactions'), 2500);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.non_field_errors?.[0] ||
        data?.detail ||
        data?.message ||
        'Gagal mengajukan peminjaman.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-80 bg-gray-100 rounded-2xl" />
              <div className="h-6 bg-gray-100 rounded w-2/3" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
            <div className="h-96 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-6 text-center">
        <Package size={48} className="text-gray-200 mx-auto mb-4" />
        <p className="text-gray-400">Barang tidak ditemukan</p>
        <Link to="/listings" className="text-blue-500 text-sm hover:underline mt-2 block">
          Kembali ke daftar barang
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === listing.owner_id;
  const isAvailable = listing.status === 'available';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri — foto & info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Foto */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-72 bg-gray-50 flex items-center justify-center">
              {listing.photos?.length > 0 ? (
                <img
                  src={listing.photos[activePhoto].photo}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={64} className="text-gray-200" />
              )}
            </div>
            {listing.photos?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {listing.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      activePhoto === idx ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={photo.photo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info barang */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-gray-800">{listing.title}</h1>
              <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                isAvailable
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-500'
              }`}>
                {isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <MapPin size={13} className="text-gray-400" />
                <span className="text-sm text-gray-400">{listing.campus_location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={13} className="text-amber-400 fill-current" />
                <span className="text-sm text-gray-400">
                  {listing.average_rating || '—'} ({listing.total_reviews || 0} ulasan)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                {listing.category_name || 'Umum'}
              </span>
            </div>

            <hr className="my-4 border-gray-50" />

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Deskripsi</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{listing.description}</p>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Kondisi Barang</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{listing.condition}</p>
            </div>
          </div>

          {/* Info penyedia */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tentang Penyedia</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                {listing.owner_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{listing.owner_name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={11} className="text-amber-400 fill-current" />
                  <span className="text-xs text-gray-400">
                    {listing.average_rating || '—'} • {listing.total_reviews || 0} ulasan
                  </span>
                </div>
              </div>
              <Link
                to={`/users/${listing.owner_id}`}
                className="ml-auto text-xs text-blue-500 hover:underline flex items-center gap-1"
              >
                Lihat profil <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Kanan — form pinjam */}
        <div className="space-y-4">
          {/* Harga */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-end gap-1 mb-1">
              <span className="text-2xl font-bold text-gray-800">
                Rp {parseInt(listing.price_per_day).toLocaleString('id-ID')}
              </span>
              <span className="text-sm text-gray-400 mb-0.5">/hari</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Shield size={12} />
              <span>Deposit: Rp {parseInt(listing.deposit_amount).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Form Pinjam */}
          {!isOwner && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Ajukan Peminjaman</h3>

              {success ? (
                <div className="text-center py-4">
                  <CheckCircle size={32} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-800">Pengajuan Terkirim!</p>
                  <p className="text-xs text-gray-400 mt-1">{success}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <div className="bg-red-50 text-red-500 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
                      <AlertCircle size={13} /> {error}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                      <Calendar size={11} className="inline mr-1" />
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                      <Calendar size={11} className="inline mr-1" />
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {days > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>Durasi</span>
                        <span className="font-medium text-gray-700">{days} hari</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Biaya sewa</span>
                        <span className="font-medium text-gray-700">
                          Rp {totalRent.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Deposit jaminan</span>
                        <span className="font-medium text-gray-700">
                          Rp {parseInt(listing.deposit_amount).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Komisi platform (10%)</span>
                        <span className="font-medium text-gray-700">
                          Rp {platformFee.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between font-semibold text-gray-800">
                        <span>Total Bayar</span>
                        <span>Rp {totalPayment.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !isAvailable}
                    className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : !isAvailable ? (
                      'Barang Tidak Tersedia'
                    ) : (
                      'Ajukan Peminjaman'
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    Deposit dikembalikan setelah barang dikembalikan
                  </p>
                </form>
              )}
            </div>
          )}

          {isOwner && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
              <p className="text-sm text-amber-600 font-medium">Ini adalah barang milikmu</p>
              <Link
                to="/my-listings"
                className="text-xs text-amber-500 hover:underline mt-1 block"
              >
                Kelola listing →
              </Link>
            </div>
          )}

          {/* Info jaminan */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Shield size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-700">Dilindungi Deposit Jaminan</p>
                <p className="text-xs text-blue-500 mt-0.5 leading-relaxed">
                  Deposit ditahan selama peminjaman dan dikembalikan penuh setelah barang dikembalikan dalam kondisi baik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;