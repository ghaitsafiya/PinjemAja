import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import {
  ArrowLeftRight, Search, Clock,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const statusConfig = {
  pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-600' },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-50 text-blue-600' },
  paid: { label: 'Dibayar', color: 'bg-blue-50 text-blue-700' },
  active: { label: 'Aktif', color: 'bg-purple-50 text-purple-600' },
  completed: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-600' },
  cancelled: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-500' },
  rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-500' },
};

const tabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Aktif', value: 'active' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Dibatalkan', value: 'cancelled' },
];

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
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
    fetchTransactions();
  }, []);

  const verifyPayment = async (paymentId) => {
    try {
      setVerifying(paymentId);

      await API.post(`/payments/${paymentId}/verify/`);

      const res = await API.get('/transactions/');
      setTransactions(res.data.results || res.data);

      alert('Pembayaran berhasil diverifikasi');
    } catch (err) {
      console.error(err);
      alert('Gagal memverifikasi pembayaran');
    } finally {
      setVerifying(null);
    }
  };

  const filtered = transactions.filter(t => {
    const matchSearch =
      t.listing_title?.toLowerCase().includes(search.toLowerCase()) ||
      t.borrower_name?.toLowerCase().includes(search.toLowerCase());

    const matchTab =
      activeTab === 'all' ? true :
      activeTab === 'active' ? ['confirmed', 'paid', 'active'].includes(t.status) :
      activeTab === 'cancelled' ? ['cancelled', 'rejected'].includes(t.status) :
      t.status === activeTab;

    return matchSearch && matchTab;
  });

  const counts = {
    all: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    active: transactions.filter(t => ['confirmed', 'paid', 'active'].includes(t.status)).length,
    completed: transactions.filter(t => t.status === 'completed').length,
    cancelled: transactions.filter(t => ['cancelled', 'rejected'].includes(t.status)).length,
  };

  const totalRevenue = transactions
    .filter(t =>
      ['paid', 'active', 'completed'].includes(t.status)
    )
    .reduce(
      (sum, t) => sum + parseFloat(t.platform_fee || 0),
      0
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Semua Transaksi</h1>
        <p className="text-sm text-gray-400 mt-1">Monitor semua transaksi di platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Transaksi', value: transactions.length, color: 'text-gray-800' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-600' },
          { label: 'Selesai', value: counts.completed, color: 'text-emerald-600' },
          { label: 'Total Revenue', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
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
          placeholder="Cari nama barang atau peminjam..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 overflow-x-auto">
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
                activeTab === tab.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {loading ? (
            [1,2,3,4,5].map(i => (
              <div key={i} className="px-5 py-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ArrowLeftRight size={40} className="mx-auto mb-3 text-gray-200" />
              <p>Tidak ada transaksi ditemukan</p>
            </div>
          ) : filtered.map((tx) => {
            const status = statusConfig[tx.status] || statusConfig.pending;
            return (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      tx.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-500'
                        : tx.status === 'cancelled' || tx.status === 'rejected'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-500'
                    }`}
                  >
                    {tx.status === 'completed' ? (
                      <CheckCircle size={16} />
                    ) : tx.status === 'cancelled' || tx.status === 'rejected' ? (
                      <XCircle size={16} />
                    ) : (
                      <Clock size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {tx.listing_title}
                    </p>
                    <p className="text-xs text-gray-400">
                      Penyewa: {tx.borrower_name}
                    </p>

                    <p className="text-xs text-gray-400">
                      Penyedia: {tx.listing_owner}
                    </p>

                    <p className="text-xs mt-1">
                      Status Pembayaran:{' '}
                      <span
                        className={
                          tx.payment_status === 'verified'
                            ? 'text-emerald-600 font-medium'
                            : tx.payment_status === 'pending'
                            ? 'text-amber-600 font-medium'
                            : 'text-gray-500'
                        }
                      >
                        {tx.payment_status || 'Belum Ada'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.start_date} → {tx.end_date} ({tx.duration_days} hari)
                    </p>
                    <p className="text-xs mt-1">
                      {tx.status === 'confirmed' && (
                        <span className="text-amber-600">
                          Menunggu Pembayaran
                        </span>
                      )}

                      {tx.status === 'paid' && (
                        <span className="text-blue-600">
                          Sudah Dibayar
                        </span>
                      )}

                      {tx.status === 'active' && (
                        <span className="text-purple-600">
                          Sedang Dipinjam
                        </span>
                      )}

                      {tx.status === 'completed' && (
                        <span className="text-emerald-600">
                          Transaksi Selesai
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      Rp {parseInt(tx.total_rent).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Fee: Rp {parseInt(tx.platform_fee).toLocaleString('id-ID')}
                    </p>
                  </div>
                  {tx.status === 'confirmed' && (
                    <button
                      onClick={async () => {
                        try {
                          await API.post(`/payments/${tx.payment_id}/verify/`);
                          window.location.reload();
                        } catch (err) {
                          console.error(err);
                          alert('Gagal verifikasi pembayaran');
                        }
                      }}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition"
                    >
                      Verifikasi Pembayaran
                    </button>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;