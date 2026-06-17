import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ShoppingBag, DollarSign, TrendingUp,
  ArrowUpRight, Clock, CheckCircle, XCircle, Package
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import API from '../../services/api';

const StatCard = ({ title, value, change, icon: Icon, color, loading }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        {loading ? (
          <div className="h-8 bg-gray-100 rounded w-24 mt-1 animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        )}
        <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
          <ArrowUpRight size={12} /> {change}
        </p>
      </div>
      <div className={`${color} p-3 rounded-2xl`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalRevenue: 0,
    activeTransactions: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch semua transaksi
        const transRes = await API.get('/transactions/');
        const transData = transRes.data.results || transRes.data;
        setTransactions(transData);

        // Fetch semua listings
        const listingsRes = await API.get('/listings/');
        const listingsData = listingsRes.data.results || listingsRes.data;
        setListings(listingsData);

        // Fetch categories
        const catRes = await API.get('/categories/');
        const catData = catRes.data.results || catRes.data;

        // Hitung distribusi kategori
        const catWithCount = catData.map(cat => ({
          name: cat.name,
          value: listingsData.filter(l => l.category_name === cat.name).length,
        }));
        setCategories(catWithCount);

        // Hitung stats
        const activeTrans = transData.filter(t =>
          ['pending', 'confirmed', 'paid', 'active'].includes(t.status)
        );
        const completedTrans = transData.filter(t => t.status === 'completed');
        const totalRevenue = completedTrans.reduce((sum, t) =>
          sum + parseFloat(t.platform_fee || 0), 0
        );

        setStats({
          totalUsers: '—', // butuh admin endpoint khusus
          totalListings: listingsData.length,
          totalRevenue: totalRevenue,
          activeTransactions: activeTrans.length,
        });

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hitung data per bulan untuk chart
  const monthlyData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const last6 = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();

      const monthTrans = transactions.filter(t => {
        const td = new Date(t.created_at);
        return td.getMonth() === monthIdx && td.getFullYear() === year;
      });

      const revenue = monthTrans
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.platform_fee || 0), 0);

      last6.push({
        month: months[monthIdx],
        revenue: parseFloat((revenue / 1000000).toFixed(2)),
        transactions: monthTrans.length,
      });
    }
    return last6;
  })();

  // Warna pie chart
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  const pendingTransactions = transactions
    .filter(t => t.status === 'pending')
    .slice(0, 5);

  const statusConfig = {
    pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-600' },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-50 text-blue-600' },
    paid: { label: 'Dibayar', color: 'bg-blue-50 text-blue-600' },
    active: { label: 'Aktif', color: 'bg-purple-50 text-purple-600' },
    completed: { label: 'Selesai', color: 'bg-emerald-50 text-emerald-600' },
    cancelled: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-500' },
    rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-500' },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Monitor dan kelola platform PinjemAja</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Listings"
          value={stats.totalListings}
          change="barang terdaftar"
          icon={ShoppingBag}
          color="bg-emerald-50 text-emerald-500"
          loading={loading}
        />
        <StatCard
          title="Total Revenue"
          value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`}
          change="komisi platform"
          icon={DollarSign}
          color="bg-amber-50 text-amber-500"
          loading={loading}
        />
        <StatCard
          title="Transaksi Aktif"
          value={stats.activeTransactions}
          change="sedang berlangsung"
          icon={TrendingUp}
          color="bg-purple-50 text-purple-500"
          loading={loading}
        />
        <StatCard
          title="Total Transaksi"
          value={transactions.length}
          change="semua waktu"
          icon={ArrowUpRight}
          color="bg-blue-50 text-blue-500"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Revenue Overview</h3>
            <p className="text-xs text-gray-400 mt-0.5">dalam juta rupiah (6 bulan terakhir)</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5}
                dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-1">Kategori</h3>
          <p className="text-xs text-gray-400 mb-4">Distribusi listing</p>
          {categories.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categories} cx="50%" cy="50%"
                    innerRadius={45} outerRadius={75}
                    dataKey="value" paddingAngle={3}>
                    {categories.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-gray-500">{cat.name}</span>
                    </div>
                    <span className="font-medium text-gray-700">{cat.value} barang</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-300 text-sm">Belum ada data</div>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-1">Jumlah Transaksi</h3>
        <p className="text-xs text-gray-400 mb-4">per bulan (6 bulan terakhir)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }} />
            <Bar dataKey="transactions" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Listings */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">Listing Terbaru</h3>
            <p className="text-xs text-gray-400 mt-0.5">Barang yang baru didaftarkan</p>
          </div>
          <Link to="/admin/listings"
            className="text-xs text-blue-500 hover:underline">
            Lihat semua →
          </Link>
        </div>
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
          ) : listings.slice(0, 5).map((listing, idx) => (
            <div key={idx} className="px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {listing.photos?.[0] ? (
                    <img src={listing.photos[0].photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={18} className="text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{listing.title}</p>
                  <p className="text-xs text-gray-400">{listing.owner_name} • {listing.category_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  listing.status === 'available'
                    ? 'bg-emerald-50 text-emerald-600'
                    : listing.status === 'borrowed'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {listing.status === 'available' ? 'Tersedia' :
                   listing.status === 'borrowed' ? 'Dipinjam' : 'Tidak Aktif'}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Rp {parseInt(listing.price_per_day).toLocaleString('id-ID')}/hari
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">Transaksi Pending</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {pendingTransactions.length} transaksi menunggu konfirmasi
            </p>
          </div>
          <Link to="/admin/transactions"
            className="text-xs text-blue-500 hover:underline">
            Lihat semua →
          </Link>
        </div>
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
          ) : pendingTransactions.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">
              Tidak ada transaksi pending
            </div>
          ) : pendingTransactions.map((tx, idx) => (
            <div key={idx} className="px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{tx.listing_title}</p>
                  <p className="text-xs text-gray-400">
                    {tx.borrower_name} • {tx.start_date} → {tx.end_date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  Rp {parseInt(tx.total_rent).toLocaleString('id-ID')}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[tx.status]?.color}`}>
                  {statusConfig[tx.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;