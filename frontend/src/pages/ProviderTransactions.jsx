import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Clock, CheckCircle, XCircle, Package,
  Calendar, AlertCircle, ArrowLeftRight, User, Shield
} from 'lucide-react';

const statusConfig = {
  pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400' },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-400' },
  paid: { label: 'Dibayar', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  active: { label: 'Berlangsung', color: 'bg-purple-50 text-purple-600', dot: 'bg-purple-400' },
  completed: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-400' },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
  rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-500', dot: 'bg-red-400' },
};

const tabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Berlangsung', value: 'active' },
  { label: 'Selesai', value: 'completed' },
];

const ProviderTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/transactions/');
      const all = res.data.results || res.data;
      // Filter hanya transaksi di mana user adalah penyedia
      const asProvider = all.filter(t => t.listing_owner_id === user?.id);
      setTransactions(asProvider);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleAction = async (id, action, extra = {}) => {
    setActionLoading(id + action);
    setError('');
    setSuccess('');
    try {
      await API.post(`/transactions/${id}/${action}/`, extra);
      const messages = {
        confirm: 'Pengajuan berhasil dikonfirmasi!',
        reject: 'Pengajuan berhasil ditolak.',
        complete: 'Pengembalian barang dikonfirmasi! Deposit dikembalikan ke penyewa.',
      };
      setSuccess(messages[action] || 'Aksi berhasil.');
      setRejectModal(null);
      setRejectReason('');
      await fetchTransactions();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal melakukan aksi.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = transactions.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['confirmed', 'paid', 'active'].includes(t.status);
    return t.status === activeTab;
  });

  const counts = {
    all: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    active: transactions.filter(t => ['confirmed', 'paid', 'active'].includes(t.status)).length,
    completed: transactions.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Kelola Peminjaman</h1>
        <p className="text-sm text-gray-400 mt-1">Pengajuan peminjaman barang milikmu</p>
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.value ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
            {counts[tab.value] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
              }`}>{counts[tab.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <ArrowLeftRight size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Belum ada pengajuan peminjaman</p>
          <p className="text-gray-300 text-sm mt-1">Pengajuan akan muncul di sini saat ada yang meminjam barangmu</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(t => {
            const status = statusConfig[t.status] || statusConfig.pending;
            const isLate = t.status === 'active' && new Date(t.end_date) < new Date();
            return (
              <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={22} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{t.listing_title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User size={11} className="text-gray-400" />
                        <p className="text-xs text-gray-400">
                          Peminjam: <span className="font-medium text-gray-600">{t.borrower_name}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                        <Calendar size={11} />
                        {t.start_date} → {t.end_date}
                        <span className="text-gray-300">•</span>
                        {t.duration_days} hari
                      </div>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${status.color}`}>
                    {t.status === 'pending' && <Clock size={11} />}
                    {['completed', 'confirmed'].includes(t.status) && <CheckCircle size={11} />}
                    {['cancelled', 'rejected'].includes(t.status) && <XCircle size={11} />}
                    {status.label}
                  </span>
                </div>

                {/* Ringkasan keuangan */}
                <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Biaya Sewa</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      Rp {parseInt(t.total_rent).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Kamu Dapat</p>
                    <p className="text-sm font-semibold text-emerald-600 mt-0.5">
                      Rp {parseInt(t.owner_earning).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Deposit</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Shield size={12} className={t.deposit_returned ? 'text-emerald-500' : 'text-amber-400'} />
                      <p className="text-xs font-medium text-gray-700">
                        {t.deposit_returned ? 'Dikembalikan' : 'Ditahan'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Peringatan terlambat */}
                {isLate && (
                  <div className="mt-3 flex items-center gap-2 bg-red-50 text-red-500 text-xs px-3 py-2 rounded-xl">
                    <AlertCircle size={13} />
                    Barang melewati tanggal pengembalian! Segera konfirmasi atau hubungi peminjam.
                  </div>
                )}

                {/* Tombol aksi */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Link to={`/listings/${t.listing}`}
                    className="text-xs text-blue-500 hover:underline">
                    Lihat barang
                  </Link>

                  {/* Pending → bisa konfirmasi atau tolak */}
                  {t.status === 'pending' && (
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => setRejectModal(t.id)}
                        disabled={actionLoading === t.id + 'reject'}
                        className="flex items-center gap-1 text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-100 transition font-medium disabled:opacity-50"
                      >
                        <XCircle size={12} /> Tolak
                      </button>
                      <button
                        onClick={() => handleAction(t.id, 'confirm')}
                        disabled={actionLoading === t.id + 'confirm'}
                        className="flex items-center gap-1 text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition font-medium disabled:opacity-50"
                      >
                        {actionLoading === t.id + 'confirm' ? (
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : <><CheckCircle size={12} /> Konfirmasi</>}
                      </button>
                    </div>
                  )}

                  {/* Active → bisa konfirmasi pengembalian */}
                  {(t.status === 'active' || t.status === 'paid') && (
                    <button
                      onClick={() => handleAction(t.id, 'complete')}
                      disabled={actionLoading === t.id + 'complete'}
                      className="ml-auto flex items-center gap-1 text-xs bg-emerald-500 text-white px-4 py-1.5 rounded-xl hover:bg-emerald-600 transition font-medium disabled:opacity-50"
                    >
                      {actionLoading === t.id + 'complete' ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : <><CheckCircle size={12} /> Konfirmasi Pengembalian</>}
                    </button>
                  )}

                  {/* Completed → bisa beri ulasan */}
                  {t.status === 'completed' && (
                    <Link to={`/transactions/${t.id}/review`}
                      className="ml-auto text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition font-medium">
                      Beri Ulasan →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tolak */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-base font-bold text-gray-800 mb-2">Tolak Pengajuan</h3>
            <p className="text-sm text-gray-400 mb-4">
              Berikan alasan penolakan (opsional) agar peminjam mengerti.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Barang sedang dalam perbaikan..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-100 transition">
                Batal
              </button>
              <button
                onClick={() => handleAction(rejectModal, 'reject', { reason: rejectReason })}
                disabled={actionLoading === rejectModal + 'reject'}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {actionLoading === rejectModal + 'reject' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : 'Ya, Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderTransactions;