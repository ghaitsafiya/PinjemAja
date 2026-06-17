import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Clock, CheckCircle, XCircle, Package,
  Calendar, ChevronRight, AlertCircle,
  ArrowLeftRight, Shield, Star, CreditCard
} from 'lucide-react';

const statusConfig = {
  pending: {
    label: 'Menunggu Konfirmasi',
    color: 'bg-amber-50 text-amber-600',
    icon: Clock,
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'bg-blue-50 text-blue-600',
    icon: CheckCircle,
  },
  paid: {
    label: 'Sudah Dibayar',
    color: 'bg-blue-50 text-blue-600',
    icon: CheckCircle,
  },
  active: {
    label: 'Sedang Berlangsung',
    color: 'bg-purple-50 text-purple-600',
    icon: ArrowLeftRight,
  },
  completed: {
    label: 'Selesai',
    color: 'bg-emerald-50 text-emerald-600',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-gray-100 text-gray-500',
    icon: XCircle,
  },
  rejected: {
    label: 'Ditolak',
    color: 'bg-red-50 text-red-500',
    icon: XCircle,
  },
};

const tabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Aktif', value: 'active' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Dibatalkan', value: 'cancelled' },
];

const TransactionCard = ({ transaction, onAction, actionLoading, currentUserId }) => {
  const status = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isOwner = transaction.listing_owner_id === currentUserId;
  const isExpired =
    transaction.status === 'active' &&
    new Date(transaction.end_date) < new Date();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      {/* Badge peran */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          isOwner
            ? 'bg-purple-50 text-purple-600'
            : 'bg-blue-50 text-blue-600'
        }`}>
          {isOwner ? '📦 Kamu sebagai Penyedia' : '🛍️ Kamu sebagai Penyewa'}
        </span>
        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
          <StatusIcon size={11} />
          {status.label}
        </span>
      </div>

      {/* Info barang */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Package size={22} className="text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {transaction.listing_title}
          </p>
          {isOwner ? (
            <p className="text-xs text-gray-400 mt-0.5">
              Dipinjam oleh: <span className="font-medium text-gray-600">{transaction.borrower_name}</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">
              Penyedia: <span className="font-medium text-gray-600">{transaction.listing_owner}</span>
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {transaction.start_date} → {transaction.end_date}
            </span>
            <span>{transaction.duration_days} hari</span>
          </div>
        </div>
      </div>

      {/* Ringkasan biaya */}
      <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-gray-400">Biaya Sewa</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            Rp {parseInt(transaction.total_rent).toLocaleString('id-ID')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">
            {isOwner ? 'Pendapatanmu' : 'Deposit'}
          </p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            {isOwner
              ? `Rp ${parseInt(transaction.owner_earning).toLocaleString('id-ID')}`
              : `Rp ${parseInt(transaction.deposit_amount).toLocaleString('id-ID')}`
            }
            {transaction.deposit_returned && !isOwner && (
              <span className="text-emerald-500 text-xs ml-1">(kembali)</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Status Deposit</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Shield
              size={12}
              className={transaction.deposit_returned ? 'text-emerald-500' : 'text-amber-400'}
            />
            <p className="text-xs font-medium text-gray-700">
              {transaction.deposit_returned ? 'Dikembalikan' : 'Ditahan'}
            </p>
          </div>
        </div>
      </div>

      {/* Peringatan terlambat */}
      {isExpired && (
        <div className="mt-3 flex items-center gap-2 bg-red-50 text-red-500 text-xs px-3 py-2 rounded-xl">
          <AlertCircle size={13} />
          <span>Barang melewati tanggal pengembalian!</span>
        </div>
      )}

      {/* Aksi */}
      <div className="mt-4 flex gap-2 flex-wrap items-center">
        <Link
          to={`/listings/${transaction.listing}`}
          className="text-xs text-blue-500 hover:underline flex items-center gap-1"
        >
          Lihat barang <ChevronRight size={11} />
        </Link>

        {/* =========================
            PENYEWA
        ========================= */}

        {!isOwner && transaction.status === 'pending' && (
          <button
            onClick={() => onAction(transaction.id, 'cancel')}
            disabled={actionLoading === transaction.id}
            className="ml-auto text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-100 transition font-medium flex items-center gap-1 disabled:opacity-50"
          >
            {actionLoading === transaction.id ? (
              <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <XCircle size={12} />
                Batalkan
              </>
            )}
          </button>
        )}

        {!isOwner && transaction.status === 'confirmed' && (
          <Link
            to={`/payment/${transaction.id}`}
            className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-1"
          >
            <CreditCard size={12} />
            Bayar Sekarang
          </Link>
        )}

        {!isOwner && transaction.status === 'paid' && (
          <span className="ml-auto text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1">
            <CheckCircle size={12} />
            Pembayaran Berhasil
          </span>
        )}

        {!isOwner && transaction.status === 'active' && (
          <span className="ml-auto text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-xl font-medium">
            Barang Sedang Dipinjam
          </span>
        )}

        {!isOwner && transaction.status === 'completed' && (
          <Link
            to={`/transactions/${transaction.id}/review`}
            className="ml-auto text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition font-medium flex items-center gap-1"
          >
            <Star size={12} />
            Beri Ulasan
          </Link>
        )}

        {/* =========================
            PENYEDIA
        ========================= */}

        {isOwner && transaction.status === 'pending' && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onAction(transaction.id, 'reject')}
              disabled={actionLoading === transaction.id}
              className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-100 transition font-medium flex items-center gap-1"
            >
              <XCircle size={12} />
              Tolak
            </button>

            <button
              onClick={() => onAction(transaction.id, 'confirm')}
              disabled={actionLoading === transaction.id}
              className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition font-medium flex items-center gap-1"
            >
              {actionLoading === transaction.id ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={12} />
                  Konfirmasi
                </>
              )}
            </button>
          </div>
        )}

        {isOwner && transaction.status === 'confirmed' && (
          <span className="ml-auto text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1">
            <Clock size={12} />
            Menunggu Pembayaran Penyewa
          </span>
        )}

        {isOwner && transaction.status === 'paid' && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1">
              <CheckCircle size={12} />
              Sudah Dibayar
            </span>
            <button
              onClick={() => onAction(transaction.id, 'activate')}
              disabled={actionLoading === transaction.id}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {actionLoading === transaction.id ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><CheckCircle size={12} /> Barang Sudah Diambil</>
              )}
            </button>
          </div>
        )}

        {isOwner && transaction.status === 'active' && (
          <button
            onClick={() => onAction(transaction.id, 'complete')}
            disabled={actionLoading === transaction.id}
            className="ml-auto text-xs bg-emerald-500 text-white px-4 py-1.5 rounded-xl hover:bg-emerald-600 transition font-medium flex items-center gap-1"
          >
            {actionLoading === transaction.id ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={12} />
                Konfirmasi Pengembalian
              </>
            )}
          </button>
        )}

        {isOwner && transaction.status === 'completed' && (
          <Link
            to={`/transactions/${transaction.id}/review`}
            className="ml-auto text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition font-medium flex items-center gap-1"
          >
            <Star size={12} />
            Beri Ulasan ke Penyewa
          </Link>
        )}
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-6 bg-gray-100 rounded-full w-40" />
      <div className="h-6 bg-gray-100 rounded-full w-32" />
    </div>
    <div className="flex gap-3">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-1">
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/transactions/');
      setTransactions(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    setError('');
    try {
      await API.post(`/transactions/${id}/${action}/`);
      await fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal melakukan aksi.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = transactions.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['confirmed', 'paid', 'active'].includes(t.status);
    if (activeTab === 'cancelled') return ['cancelled', 'rejected'].includes(t.status);
    return t.status === activeTab;
  });

  const counts = {
    all: transactions.length,
    active: transactions.filter(t => ['confirmed', 'paid', 'active'].includes(t.status)).length,
    pending: transactions.filter(t => t.status === 'pending').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    cancelled: transactions.filter(t => ['cancelled', 'rejected'].includes(t.status)).length,
  };

  // Hitung pending yang butuh aksi dari penyedia
  const pendingAsOwner = transactions.filter(
    t => t.status === 'pending' && t.listing_owner_id === user?.id
  ).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Transaksi Saya</h1>
        <p className="text-sm text-gray-400 mt-1">
          Riwayat dan status peminjaman barang
        </p>
      </div>

      {/* Banner notif penyedia jika ada yang perlu dikonfirmasi */}
      {pendingAsOwner > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-700">
              {pendingAsOwner} pengajuan menunggu konfirmasimu
            </p>
            <p className="text-xs text-amber-500 mt-0.5">
              Klik tab "Menunggu" dan terima atau tolak pengajuan penyewa
            </p>
          </div>
          <button
            onClick={() => setActiveTab('pending')}
            className="ml-auto text-xs bg-amber-500 text-white px-3 py-1.5 rounded-xl hover:bg-amber-600 transition font-medium flex-shrink-0"
          >
            Lihat
          </button>
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
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.value
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.value
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ArrowLeftRight size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">
            {activeTab === 'all'
              ? 'Belum ada transaksi'
              : `Tidak ada transaksi ${tabs.find(t => t.value === activeTab)?.label.toLowerCase()}`}
          </p>
          {activeTab === 'all' && (
            <Link
              to="/listings"
              className="inline-block mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              Cari Barang
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(transaction => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onAction={handleAction}
              actionLoading={actionLoading}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;