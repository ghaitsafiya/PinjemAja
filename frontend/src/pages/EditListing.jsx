import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import {
  Package, MapPin, DollarSign, Image,
  X, AlertCircle, CheckCircle, ChevronLeft
} from 'lucide-react';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '', category: '', description: '',
    condition: '', price_per_day: '', deposit_amount: '', campus_location: '',
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingRes, categoriesRes] = await Promise.all([
          API.get(`/listings/${id}/`),
          API.get('/categories/'),
        ]);
        const l = listingRes.data;
        setFormData({
          title: l.title,
          category: l.category || '',
          description: l.description,
          condition: l.condition,
          price_per_day: l.price_per_day,
          deposit_amount: l.deposit_amount,
          campus_location: l.campus_location,
        });
        setExistingPhotos(l.photos || []);
        setCategories(categoriesRes.data.results || categoriesRes.data);
      } catch (e) {
        setError('Gagal memuat data listing.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNewPhoto = (e) => {
    const files = Array.from(e.target.files);
    const total = existingPhotos.length + newPhotos.length + files.length;
    if (total > 5) { setError('Maksimal 5 foto.'); return; }
    setNewPhotos(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeNewPhoto = (idx) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      newPhotos.forEach(p => data.append('uploaded_photos', p));
      await API.patch(`/listings/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => navigate('/my-listings'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-6 max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-5 bg-gray-100 rounded w-32" />
      <div className="h-64 bg-gray-100 rounded-2xl" />
      <div className="h-48 bg-gray-100 rounded-2xl" />
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Listing Berhasil Diperbarui!</h2>
        <p className="text-gray-400 text-sm">Mengalihkan ke Barang Saya...</p>
      </div>
    </div>
  );

  const totalPhotos = existingPhotos.length + newPhotos.length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition">
        <ChevronLeft size={16} /> Kembali
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Edit Listing</h1>
        <p className="text-sm text-gray-400 mt-1">Perbarui informasi barang kamu</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Foto */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Image size={15} className="text-gray-400" /> Foto Barang
            <span className="text-xs text-gray-400 font-normal">({totalPhotos}/5)</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {existingPhotos.map((photo, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <img src={`http://localhost:8000${photo.photo}`} alt=""
                  className="w-full h-full object-cover rounded-xl border border-gray-100" />
                <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 rounded">
                  Ada
                </span>
              </div>
            ))}
            {newPreviews.map((src, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-blue-200" />
                <button type="button" onClick={() => removeNewPhoto(idx)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X size={11} />
                </button>
              </div>
            ))}
            {totalPhotos < 5 && (
              <label className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition">
                <Image size={20} className="text-gray-300 mb-1" />
                <span className="text-xs text-gray-400">Tambah</span>
                <input type="file" accept="image/*" multiple onChange={handleNewPhoto} className="hidden" />
              </label>
            )}
          </div>
          {existingPhotos.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Foto lama akan tetap ada. Foto baru yang ditambahkan akan ditambahkan ke listing.
            </p>
          )}
        </div>

        {/* Info Barang */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Package size={15} className="text-gray-400" /> Info Barang
          </h3>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Nama Barang *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Kategori *</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100">
              <option value="">Pilih kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Deskripsi *</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Kondisi Barang *</label>
            <textarea name="condition" value={formData.condition} onChange={handleChange}
              rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
          </div>
        </div>

        {/* Harga & Lokasi */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <DollarSign size={15} className="text-gray-400" /> Harga & Lokasi
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">Harga/Hari (Rp) *</label>
              <input type="number" name="price_per_day" value={formData.price_per_day}
                onChange={handleChange} min="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">Deposit (Rp) *</label>
              <input type="number" name="deposit_amount" value={formData.deposit_amount}
                onChange={handleChange} min="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block flex items-center gap-1">
              <MapPin size={13} /> Lokasi di Kampus *
            </label>
            <input type="text" name="campus_location" value={formData.campus_location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
};

export default EditListing;