import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Package, Clock, MapPin, Star,
  BookOpen, Laptop, Calculator, ChevronRight,
  ArrowUpRight, DollarSign, TrendingUp, Plus
} from 'lucide-react';

const StatCard = ({ label, value, sub, color, loading }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <p className="text-sm text-gray-400">{label}</p>
    {loading ? (
      <div className="h-8 bg-gray-100 rounded w-16 mt-1 animate-pulse" />
    ) : (
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    )}
    {sub && <p className={`text-xs mt-1 ${color || 'text-gray-400'}`}>{sub}</p>}
  </div>
);

const categoryIcons = {
  Elektronik: Laptop,
  Buku: BookOpen,
  'Alat Tulis': Calculator,
  Lainnya: Package,
  Olahraga: Package,
};

const categoryColors = {
  Elektronik: { bg: 'bg-blue-50', color: 'text-blue-500' },
  Buku: { bg: 'bg-emerald-50', color: 'text-emerald-500' },
  'Alat Tulis': { bg: 'bg-amber-50', color: 'text-amber-500' },
  Lainnya: { bg: 'bg-purple-50', color: 'text-purple-500' },
  Olahraga: { bg: 'bg-red-50', color: 'text-red-500' },
};

const Home = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [stats, setStats] = useState({
    activeBorrows: 0,
    completedTransactions: 0,
    myListings: 0,
    avgRating: null,
  });
  const [earnings, setEarnings] = useState({
    total_earnings: 0,
    completed_transactions: 0,
    active_lending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listingsRes = await API.get('/listings/');
        const listingsData = listingsRes.data.results || listingsRes.data;
        setListings(listingsData);

        const categoriesRes = await API.get('/categories/');
        const categoriesData = categoriesRes.data.results || categoriesRes.data;

        const categoriesWithCount = categoriesData.map(cat => ({
          ...cat,
          count: listingsData.filter(l => l.category_name === cat.name).length,
        }));
        setCategories(categoriesWithCount);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const transRes = await API.get('/transactions/');
        const transactions = transRes.data.results || transRes.data;

        const active = transactions.filter(t =>
          ['active', 'confirmed', 'paid'].includes(t.status)
        );
        const completed = transactions.filter(t => t.status === 'completed');

        setActiveBorrows(active.slice(0, 2));

        const myListingsRes = await API.get('/listings/?owner=me');
        const myListings = myListingsRes.data.results || myListingsRes.data;

        const profile = await API.get('/auth/profile/');
        const avgRating = profile.data.average_rating;

        setStats({
          activeBorrows: active.length,
          completedTransactions: completed.length,
          myListings: myListings.length,
          avgRating: avgRating,
        });

        // Fetch ringkasan pendapatan
        const earningsRes = await API.get('/transactions/earnings_summary/');
        setEarnings(earningsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchData();
    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold">
          Halo, {user?.full_name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Cari dan pinjam barang dari teman sekampusmu
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Sedang Dipinjam"
          value={stats.activeBorrows}
          sub="Aktif"
          color="text-blue-500"
          loading={statsLoading}
        />
        <StatCard
          label="Transaksi Selesai"
          value={stats.completedTransactions}
          sub="Total"
          color="text-emerald-500"
          loading={statsLoading}
        />
        <StatCard
          label="Barang Saya"
          value={stats.myListings}
          sub="Listing aktif"
          color="text-amber-500"
          loading={statsLoading}
        />
        <StatCard
          label="Rating Kamu"
          value={stats.avgRating ? `${stats.avgRating}★` : '—'}
          sub={stats.avgRating ? 'dari 5' : 'Belum ada'}
          color="text-purple-500"
          loading={statsLoading}
        />
      </div>

      {/* Card Pendapatan - hanya tampil jika user punya listing */}
      {!statsLoading && stats.myListings > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-2xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-50" />
                <p className="text-sm text-emerald-50">Total Pendapatan</p>
              </div>
              <p className="text-2xl font-bold mt-1">
                Rp {earnings.total_earnings.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-emerald-50 mt-1">
                Dari {earnings.completed_transactions} transaksi selesai sebagai penyedia
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-2xl">
              <TrendingUp size={20} />
            </div>
          </div>
          {earnings.active_lending > 0 && (
            <div className="mt-3 pt-3 border-t border-white border-opacity-20 flex items-center gap-2 text-xs">
              <Clock size={12} />
              <span>{earnings.active_lending} barang sedang dalam proses peminjaman</span>
            </div>
          )}
        </div>
      )}

      {/* CTA tambah barang jika belum punya listing */}
      {!statsLoading && stats.myListings === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-6 text-center">
          <Package size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Belum punya barang untuk disewakan?</p>
          <p className="text-xs text-gray-400 mt-1 mb-3">
            Tambahkan barangmu dan mulai dapatkan penghasilan tambahan
          </p>
          <Link
            to="/my-listings/add"
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition"
          >
            <Plus size={15} /> Tambah Barang
          </Link>
        </div>
      )}

      {/* Active Borrows */}
      {activeBorrows.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-800">Sedang Dipinjam</h2>
            <Link to="/transactions" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
              Lihat semua <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBorrows.map((item) => {
              const daysLeft = Math.ceil(
                (new Date(item.end_date) - new Date()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{item.listing_title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Penyedia: {item.listing_owner}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      daysLeft <= 1
                        ? 'bg-red-50 text-red-500'
                        : daysLeft <= 3
                        ? 'bg-amber-50 text-amber-500'
                        : 'bg-blue-50 text-blue-500'
                    }`}>
                      {daysLeft <= 0 ? 'Terlambat!' : `${daysLeft}h lagi`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>Dikembalikan: {item.end_date}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                    <div
                      className={`h-1.5 rounded-full ${
                        daysLeft <= 1 ? 'bg-red-400' :
                        daysLeft <= 3 ? 'bg-amber-400' : 'bg-blue-400'
                      }`}
                      style={{
                        width: `${Math.max(5, Math.min(100, (daysLeft / 7) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Kategori Populer</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const Icon = categoryIcons[cat.name] || Package;
              const colorConfig = categoryColors[cat.name] || {
                bg: 'bg-gray-50', color: 'text-gray-500'
              };
              return (
                <Link
                  key={idx}
                  to={`/listings?category=${cat.name}`}
                  className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-md transition shadow-sm"
                >
                  <div className={`${colorConfig.bg} ${colorConfig.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-3`}>
                    <Icon size={22} />
                  </div>
                  <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.count} barang</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Listings */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-gray-800">Rekomendasi untukmu</h2>
          <Link to="/listings" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
            Lihat semua <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
                <div className="h-36 bg-gray-100 rounded-xl mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
            <Package size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Belum ada barang tersedia</p>
            <Link
              to="/my-listings/add"
              className="inline-block mt-3 text-sm text-blue-500 hover:underline"
            >
              Tambahkan barang pertamamu →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.slice(0, 6).map((item) => (
              <Link
                to={`/listings/${item.id}`}
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition shadow-sm"
              >
                <div className="h-36 bg-gray-50 flex items-center justify-center relative">
                  {item.photos?.[0] ? (
                    <img
                      src={item.photos[0].photo}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={36} className="text-gray-300" />
                  )}
                  {item.status !== 'available' && (
                    <span className="absolute top-2 right-2 text-xs bg-gray-900 bg-opacity-80 text-white px-2 py-0.5 rounded-full">
                      {item.status === 'borrowed' ? 'Dipinjam' : 'Tidak Tersedia'}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800 text-sm leading-tight">
                      {item.title}
                    </h3>
                    <ArrowUpRight size={16} className="text-gray-300 flex-shrink-0 ml-2" />
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin size={11} className="text-gray-300" />
                    <span className="text-xs text-gray-400">{item.campus_location}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-amber-400 fill-current" />
                    <span className="text-xs text-gray-400">
                      {item.average_rating || '—'} ({item.total_reviews || 0})
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <span className="text-base font-bold text-gray-800">
                        Rp {parseInt(item.price_per_day).toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-gray-400">/hari</span>
                    </div>
                    <span className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-xl">
                      Lihat
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;