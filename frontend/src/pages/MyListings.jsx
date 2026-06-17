import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  Plus, Package, MapPin, Star, Edit2,
  Trash2, Eye, EyeOff, AlertCircle, CheckCircle
} from 'lucide-react';

const statusConfig = {
  available: { label: 'Tersedia', color: 'bg-emerald-50 text-emerald-600' },
  unavailable: { label: 'Tidak Tersedia', color: 'bg-gray-100 text-gray-500' },
  borrowed: { label: 'Sedang Dipinjam', color: 'bg-blue-50 text-blue-600' },
};

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings/?owner=me');
      setListings(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    setActionLoading(id);
    setError('');
    try {
      const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
      await API.patch(`/listings/${id}/set_status/`, { status: newStatus });
      setSuccess(`Status berhasil diubah menjadi ${newStatus === 'available' ? 'Tersedia' : 'Tidak Tersedia'}.`);
      await fetchMyListings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal mengubah status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus listing ini?')) return;
    setActionLoading(id);
    try {
      await API.delete(`/listings/${id}/`);
      setSuccess('Listing berhasil dihapus.');
      await fetchMyListings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menghapus listing.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Barang Saya</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola listing barang yang kamu sewakan</p>
        </div>
        <Link
          to="/my-listings/add"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition"
        >
          <Plus size={16} /> Tambah Barang
        </Link>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <CheckCircle size={15} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Listing', value: listings.length, color: 'text-gray-800' },
          { label: 'Tersedia', value: listings.filter(l => l.status === 'available').length, color: 'text-emerald-600' },
          { label: 'Sedang Dipinjam', value: listings.filter(l => l.status === 'borrowed').length, color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <Package size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Belum ada barang</p>
          <p className="text-gray-300 text-sm mt-1">Mulai sewakan barangmu sekarang</p>
          <Link
            to="/my-listings/add"
            className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={15} /> Tambah Barang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(item => {
            const status = statusConfig[item.status] || statusConfig.available;
            return (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
                <div className="flex gap-4">
                  {/* Foto */}
                  <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.photos?.[0] ? (
                      <img
                        src={item.photos[0].photo}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={28} className="text-gray-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-800 truncate">{item.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {item.campus_location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-amber-400 fill-current" />
                        {item.average_rating || '—'} ({item.total_reviews || 0})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm font-bold text-gray-800">
                        Rp {parseInt(item.price_per_day).toLocaleString('id-ID')}
                        <span className="text-xs font-normal text-gray-400">/hari</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        Deposit: Rp {parseInt(item.deposit_amount).toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Aksi */}
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        to={`/listings/${item.id}`}
                        className="text-xs text-blue-500 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition font-medium"
                      >
                        Lihat
                      </Link>
                      <Link
                        to={`/my-listings/edit/${item.id}`}
                        className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition font-medium"
                      >
                        <Edit2 size={11} /> Edit
                      </Link>
                      {item.status !== 'borrowed' && (
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          disabled={actionLoading === item.id}
                          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition font-medium disabled:opacity-50 ${
                            item.status === 'available'
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {actionLoading === item.id ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : item.status === 'available' ? (
                            <><EyeOff size={11} /> Nonaktifkan</>
                          ) : (
                            <><Eye size={11} /> Aktifkan</>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={actionLoading === item.id || item.status === 'borrowed'}
                        className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100 transition font-medium disabled:opacity-30 ml-auto"
                      >
                        <Trash2 size={11} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyListings;