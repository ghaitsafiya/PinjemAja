import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  User, Mail, Phone, FileText,
  Camera, CheckCircle, AlertCircle, Lock, Eye, EyeOff
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_whatsapp: user?.phone_whatsapp || '',
    bio: user?.bio || '',
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });
  const [showPass, setShowPass] = useState({
    old: false, new: false, new2: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await API.patch('/auth/profile/', formData);
      setSuccess('Profil berhasil diperbarui!');
    } catch (err) {
      setError('Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password2) {
      setError('Password baru tidak cocok.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await API.post('/auth/profile/change-password/', passwordData);
      setSuccess('Password berhasil diubah!');
      setPasswordData({ old_password: '', new_password: '', new_password2: '' });
    } catch (err) {
      setError(err.response?.data?.old_password?.[0] || 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Profil Saya</h1>
        <p className="text-sm text-gray-400 mt-1">Kelola informasi akun kamu</p>
      </div>

      {/* Avatar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-3xl font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-500 transition shadow-sm">
              <Camera size={13} />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{user?.full_name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={10} /> Terverifikasi
              </span>
              <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
                {user?.university_domain}
              </span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-gray-800">{user?.average_rating || '—'}</p>
            <p className="text-xs text-gray-400">Rating</p>
            <p className="text-sm font-medium text-gray-600 mt-1">{user?.total_reviews || 0} ulasan</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {[
          { label: 'Info Profil', value: 'profile' },
          { label: 'Ubah Password', value: 'password' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.value
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert */}
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

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Lengkap</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-100 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nomor WhatsApp</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone_whatsapp}
                  onChange={(e) => setFormData({ ...formData, phone_whatsapp: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Bio</label>
              <div className="relative">
                <FileText size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {[
              { label: 'Password Lama', key: 'old_password', show: 'old' },
              { label: 'Password Baru', key: 'new_password', show: 'new' },
              { label: 'Konfirmasi Password Baru', key: 'new_password2', show: 'new2' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">{field.label}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass[field.show] ? 'text' : 'password'}
                    value={passwordData[field.key]}
                    onChange={(e) => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({ ...showPass, [field.show]: !showPass[field.show] })}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass[field.show] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Ubah Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;