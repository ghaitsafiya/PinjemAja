import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import {
  Upload, X, MapPin, ChevronLeft,
  CheckCircle, AlertCircle, Navigation
} from 'lucide-react';

const AddListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [locating, setLocating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    condition: '',
    price_per_day: '',
    deposit_amount: '',
    campus_location: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories/');
        setCategories(res.data.results || res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();

    if (isEdit) {
      const fetchListing = async () => {
        try {
          const res = await API.get(`/listings/${id}/`);
          const data = res.data;
          setFormData({
            title: data.title || '',
            category: data.category || '',
            description: data.description || '',
            condition: data.condition || '',
            price_per_day: data.price_per_day || '',
            deposit_amount: data.deposit_amount || '',
            campus_location: data.campus_location || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
          });
          if (data.photos?.length > 0) {
            setPhotoPreviews(data.photos.map(p => p.photo));
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchListing();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const totalPhotos = photos.length + files.length;
    if (totalPhotos > 5) {
      setError('Maksimal 5 foto.');
      return;
    }
    setPhotos(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => [...prev, ...previews]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
        // Reverse geocoding sederhana
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            campus_location: data.display_name || `${latitude}, ${longitude}`,
          }));
        } catch (e) {
          setFormData(prev => ({
            ...prev,
            campus_location: `${latitude}, ${longitude}`,
          }));
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isEdit && photos.length === 0) {
      setError('Upload minimal 1 foto barang.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      photos.forEach(photo => {
        data.append('uploaded_photos', photo);
      });

      if (isEdit) {
        await API.patch(`/listings/${id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Listing berhasil diperbarui!');
      } else {
        await API.post('/listings/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Listing berhasil ditambahkan!');
      }
      setTimeout(() => navigate('/my-listings'), 2000);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
        data?.title?.[0] ||
        data?.non_field_errors?.[0] ||
        'Gagal menyimpan listing.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {isEdit ? 'Listing Diperbarui!' : 'Listing Ditambahkan!'}
        </h2>
        <p className="text-gray-400 text-sm">Mengalihkan ke halaman barang saya...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-1">
        {isEdit ? 'Edit Listing' : 'Tambah Barang'}
      </h1>
      <p className="text-sm text-gray-400 mb-6">
        {isEdit ? 'Perbarui informasi barang kamu' : 'Daftarkan barang yang ingin kamu sewakan'}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Foto */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Foto Barang <span className="text-gray-400 font-normal">(min. 1, maks. 5)</span>
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {photoPreviews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square">
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {photoPreviews.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition">
                <Upload size={18} className="text-gray-300 mb-1" />
                <span className="text-xs text-gray-300">Tambah</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Info Dasar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Informasi Barang</h3>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Barang</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Laptop ASUS ROG"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kategori</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsikan barang kamu..."
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kondisi Barang</label>
            <textarea
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              placeholder="Contoh: Kondisi baik, sudah dipakai 1 tahun, tidak ada goresan"
              rows={2}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
              required
            />
          </div>
        </div>

        {/* Harga */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Harga & Deposit</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Harga Sewa/Hari (Rp)
              </label>
              <input
                type="number"
                name="price_per_day"
                value={formData.price_per_day}
                onChange={handleChange}
                placeholder="10000"
                min="0"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Deposit Jaminan (Rp)
              </label>
              <input
                type="number"
                name="deposit_amount"
                value={formData.deposit_amount}
                onChange={handleChange}
                placeholder="50000"
                min="0"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600">
            💡 Deposit disarankan 2-3x harga sewa untuk melindungi barangmu
          </div>
        </div>

        {/* Lokasi */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Lokasi Pengambilan</h3>
            <button
              type="button"
              onClick={getLocation}
              disabled={locating}
              className="flex items-center gap-1.5 text-xs text-blue-500 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition font-medium disabled:opacity-50"
            >
              {locating ? (
                <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Navigation size={12} />
              )}
              {locating ? 'Mencari...' : 'Gunakan Lokasi Saya'}
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Alamat Lengkap
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="campus_location"
                value={formData.campus_location}
                onChange={handleChange}
                placeholder="Contoh: Gedung A lt.2, Kampus UDINUS, Jl. Imam Bonjol No.207"
                rows={2}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                required
              />
            </div>
          </div>

          {formData.latitude && formData.longitude && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">
              <CheckCircle size={12} />
              Koordinat GPS tersimpan: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isEdit ? 'Simpan Perubahan' : 'Tambahkan Barang'}
        </button>
      </form>
    </div>
  );
};

export default AddListing;