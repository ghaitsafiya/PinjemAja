import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import {
  Flag, CheckCircle, XCircle,
  AlertCircle, Clock, Search, Star
} from 'lucide-react';

const AdminReports = () => {
  const [reportedReviews, setReportedReviews] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const transRes = await API.get('/transactions/');
        const transData = transRes.data.results || transRes.data;
        setTransactions(transData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Transaksi bermasalah — terlambat dikembalikan
  const lateTransactions = transactions.filter(t => {
    if (t.status !== 'active') return false;
    return new Date(t.end_date) < new Date();
  });

  // Transaksi yang dibatalkan
  const cancelledTransactions = transactions.filter(t =>
    ['cancelled', 'rejected'].includes(t.status)
  );

  const tabs = [
    { label: 'Keterlambatan', value: 'late', count: lateTransactions.length },
    { label: 'Dibatalkan', value: 'cancelled', count: cancelledTransactions.length },
    { label: 'Semua Masalah', value: 'all', count: lateTransactions.length + cancelledTransactions.length },
  ];

  const getFilteredData = () => {
    let data = [];
    if (activeTab === 'late') data = lateTransactions;
    else if (activeTab === 'cancelled') data = cancelledTransactions;
    else data = [...lateTransactions, ...cancelledTransactions];

    if (search) {
      data = data.filter(t =>
        t.listing_title?.toLowerCase().includes(search.toLowerCase()) ||
        t.borrower_name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  };

  const filtered = getFilteredData();

  const daysLate = (endDate) => {
    const diff = new Date() - new Date(endDate);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Laporan & Sengketa</h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor masalah transaksi dan sengketa pengguna
        </p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Transaksi',
            value: transactions.length,
            color: 'text-gray-800',
            bg: 'bg-gray-50 text-gray-500'
          },
          {
            label: 'Terlambat',
            value: lateTransactions.length,
            color: 'text-red-600',
            bg: 'bg-red-50 text-red-500'
          },
          {
            label: 'Dibatalkan',
            value: cancelledTransactions.length,
            color: 'text-amber-600',
            bg: 'bg-amber-50 text-amber-500'
          },
          {
            label: 'Selesai Normal',
            value: transactions.filter(t => t.status === 'completed').length,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 text-emerald-500'
          },
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
          placeholder="Cari nama barang atau peminjam..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.value
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.value
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="px-5 py-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Flag size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Tidak ada laporan ditemukan</p>
              <p className="text-gray-300 text-sm mt-1">
                {activeTab === 'late'
                  ? 'Tidak ada transaksi yang terlambat'
                  : 'Tidak ada transaksi yang dibatalkan'}
              </p>
            </div>
          ) : filtered.map((tx) => {
            const isLate = tx.status === 'active' && new Date(tx.end_date) < new Date();
            const late = isLate ? daysLate(tx.end_date) : 0;

            return (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isLate ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                  }`}>
                    {isLate ? <AlertCircle size={18} /> : <XCircle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {tx.listing_title}
                    </p>
                    <p className="text-xs text-gray-400">
                      Peminjam: {tx.borrower_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.start_date} → {tx.end_date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      Rp {parseInt(tx.total_rent).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Deposit: Rp {parseInt(tx.deposit_amount).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {isLate ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-50 text-red-500 flex items-center gap-1">
                      <Clock size={11} /> Terlambat {late} hari
                    </span>
                  ) : (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      tx.status === 'cancelled'
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {tx.status === 'cancelled' ? 'Dibatalkan' : 'Ditolak'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-700">Catatan Admin</p>
            <p className="text-xs text-blue-500 mt-0.5 leading-relaxed">
              Untuk sengketa barang rusak atau tidak dikembalikan, hubungi kedua pihak melalui 
              kontak WhatsApp yang terdaftar dan selesaikan melalui admin panel Django di{' '}
              <a href="http://localhost:8000/admin" target="_blank" rel="noreferrer"
                className="underline font-medium">
                localhost:8000/admin
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;