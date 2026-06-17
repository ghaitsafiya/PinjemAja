import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  Search, Filter, MapPin, Star, Package,
  ChevronDown, X, Navigation
} from 'lucide-react';

const sortOptions = [
  { label: 'Terbaru', value: '-created_at' },
  { label: 'Harga Termurah', value: 'price_per_day' },
  { label: 'Harga Termahal', value: '-price_per_day' },
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;
  const R = 6371; // radius bumi dalam km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (km) => {
  if (km === null) return null;
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  }
  return `${km.toFixed(1)} km`;
};

const ListingCard = ({ item }) => (
  <Link to={`/listings/${item.id}`} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition shadow-sm group">
    <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
      {item.photos?.[0] ? (
        <img
          src={item.photos[0].photo}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      ) : (
        <Package size={40} className="text-gray-300" />
      )}
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-800 text-sm leading-tight line-clamp-2">{item.title}</h3>
        {item.status === 'available' && (
          <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex-shrink-0">
            Tersedia
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <MapPin size={11} className="text-gray-300 flex-shrink-0" />
        <span className="text-xs text-gray-400 truncate">{item.campus_location}</span>
      </div>
      {item.distance !== undefined && item.distance !== null && (
        <div className="flex items-center gap-1 mt-1">
          <Navigation size={11} className="text-green-700 flex-shrink-0" />
          <span className="text-xs font-medium text-green-700">
            {formatDistance(item.distance)} dari lokasimu
          </span>
        </div>
      )}
      <div className="flex items-center gap-1 mt-1">
        <Star size={11} className="text-amber-400 fill-current flex-shrink-0" />
        <span className="text-xs text-gray-400">
          {item.average_rating || '—'} ({item.total_reviews || 0} ulasan)
        </span>
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
        <div>
          <span className="text-base font-bold text-gray-800">
            Rp {parseInt(item.price_per_day).toLocaleString('id-ID')}
          </span>
          <span className="text-xs text-gray-400">/hari</span>
        </div>
        <div className="text-xs text-gray-400">
          Deposit: Rp {parseInt(item.deposit_amount).toLocaleString('id-ID')}
        </div>
      </div>
    </div>
  </Link>
);

const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-100" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-1/2 mt-3" />
    </div>
  </div>
);

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [showFilter, setShowFilter] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locating, setLocating] = useState(false);
  const [categories, setCategories] = useState([{ label: 'Semua', value: '' }]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung geolokasi.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSortByDistance(true);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.');
        setLocating(false);
      }
    );
  };

  const clearLocationSort = () => {
    setSortByDistance(false);
    setUserLocation(null);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sortBy && !sortByDistance) params.append('ordering', sortBy);

      const res = await API.get(`/listings/?${params.toString()}`);
      let data = res.data.results || res.data;

      if (selectedCategory) {
        data = data.filter(item =>
          item.category_name?.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
      if (priceMin) data = data.filter(i => parseFloat(i.price_per_day) >= parseFloat(priceMin));
      if (priceMax) data = data.filter(i => parseFloat(i.price_per_day) <= parseFloat(priceMax));

      // Hitung & sort berdasarkan jarak jika lokasi user tersedia
      if (userLocation) {
        data = data.map(item => ({
          ...item,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            item.latitude !== null && item.latitude !== undefined ? parseFloat(item.latitude) : null,
            item.longitude !== null && item.longitude !== undefined ? parseFloat(item.longitude) : null
          )
        }));

        if (sortByDistance) {
          data = data.sort((a, b) => {
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
        }
      }

      setListings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchListings, 400);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory, sortBy, sortByDistance, userLocation]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories/');
        const data = res.data.results || res.data;
        setCategories([
          { label: 'Semua', value: '' },
          ...data.map(cat => ({ label: cat.name, value: cat.name })),
        ]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterApply = () => {
    fetchListings();
    setShowFilter(false);
  };

  const handleFilterReset = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedCategory('');
    setShowFilter(false);
  };

  const activeFilters = [
    selectedCategory && { label: selectedCategory, onRemove: () => setSelectedCategory('') },
    priceMin && { label: `Min Rp${parseInt(priceMin).toLocaleString('id-ID')}`, onRemove: () => setPriceMin('') },
    priceMax && { label: `Max Rp${parseInt(priceMax).toLocaleString('id-ID')}`, onRemove: () => setPriceMax('') },
  ].filter(Boolean);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Cari Barang</h1>
        <p className="text-sm text-gray-400 mt-1">Temukan barang yang kamu butuhkan dari sesama mahasiswa</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
          />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <button
          onClick={sortByDistance ? clearLocationSort : getUserLocation}
          disabled={locating}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border shadow-sm transition disabled:opacity-50 ${
            sortByDistance
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-600 border-gray-100'
          }`}
        >
          {locating ? (
            <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation size={15} />
          )}
          {sortByDistance ? 'Terdekat' : 'Lokasi'}
        </button>

        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border shadow-sm transition ${
            showFilter || activeFilters.length > 0
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-100'
          }`}
        >
          <Filter size={15} />
          Filter
          {activeFilters.length > 0 && (
            <span className="bg-white text-blue-600 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      selectedCategory === cat.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Harga Min (Rp/hari)</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Harga Max (Rp/hari)</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="999999"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleFilterApply}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              Terapkan Filter
            </button>
            <button
              onClick={handleFilterReset}
              className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((f, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full">
              {f.label}
              <button onClick={f.onRemove}><X size={11} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition ${
              selectedCategory === cat.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-blue-200 hover:text-blue-500'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Info lokasi aktif */}
      {sortByDistance && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs px-3 py-2 rounded-xl mb-4">
          <Navigation size={13} />
          <span>Menampilkan barang berdasarkan jarak terdekat dari lokasimu</span>
        </div>
      )}

      {!loading && (
        <p className="text-sm text-gray-400 mb-4">
          {listings.length} barang ditemukan
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Tidak ada barang ditemukan</p>
          <p className="text-gray-300 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map(item => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Listings;