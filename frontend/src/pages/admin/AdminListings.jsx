import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import {
  Package, Search, Eye, EyeOff,
  Trash2, CheckCircle, AlertCircle, Filter
} from 'lucide-react';

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings/');
      setListings(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleToggleActive = async (id, isActive) => {
    setActionLoading(id);
    try {
      await API.patch(`/listings/${id}/toggle_active/`);
      setSuccess(`Listing berhasil ${isActive ? 'dinonaktifkan' : 'diaktifkan'}.`);
      await fetchListings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Gagal mengubah status listing.');
      setTimeout(() => setError(''), 3000);
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
      await fetchListings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Gagal menghapus listing.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.owner_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Kelola Listing</h1>
        <p className="text-sm text-gray-400 mt-1">Monitor dan moderasi semua listing barang</p>
      </div>

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
          { label: 'Aktif', value: listings.filter(l => l.is_active).length, color: 'text-emerald-600' },
          { label: 'Nonaktif', value: listings.filter(l => !l.is_active).length, color: 'text-red-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau nama pemilik..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {loading ? (
            [1,2,3,4,5].map(i => (
              <div key={i} className="px-5 py-4 animate-pulse flex gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-3 text-gray-200" />
              <p>Tidak ada listing ditemukan</p>
            </div>
          ) : filtered.map((listing) => (
            <div key={listing.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {listing.photos?.[0] ? (
                    <img src={listing.photos[0].photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={20} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{listing.title}</p>
                  <p className="text-xs text-gray-400">{listing.owner_name} • {listing.category_name}</p>
                  <p className="text-xs text-gray-400">{listing.campus_location?.split(',')[0]}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">
                    Rp {parseInt(listing.price_per_day).toLocaleString('id-ID')}/hari
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    listing.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                    listing.status === 'borrowed' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {listing.status === 'available' ? 'Tersedia' :
                     listing.status === 'borrowed' ? 'Dipinjam' : 'Tidak Aktif'}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleActive(listing.id, listing.is_active)}
                  disabled={actionLoading === listing.id}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition font-medium disabled:opacity-50 ${
                    listing.is_active
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {listing.is_active
                    ? <><EyeOff size={12} /> Nonaktifkan</>
                    : <><Eye size={12} /> Aktifkan</>
                  }
                </button>

                <button
                  onClick={() => handleDelete(listing.id)}
                  disabled={actionLoading === listing.id || listing.status === 'borrowed'}
                  className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100 transition font-medium disabled:opacity-30"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminListings;