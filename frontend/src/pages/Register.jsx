import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import API from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    password2: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email.endsWith('.ac.id')) {
      setError('Hanya email dengan domain .ac.id yang diizinkan.');
      return;
    }
    if (formData.password !== formData.password2) {
      setError('Password tidak cocok.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/register/', formData);
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.full_name?.[0] ||
        data?.message ||
        'Registrasi gagal. Coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (p.length === 0) return null;
    if (p.length < 6) return { label: 'Lemah', color: 'bg-red-400', width: 'w-1/4' };
    if (p.length < 8) return { label: 'Cukup', color: 'bg-amber-400', width: 'w-2/4' };
    if (p.length < 12) return { label: 'Kuat', color: 'bg-blue-400', width: 'w-3/4' };
    return { label: 'Sangat Kuat', color: 'bg-emerald-400', width: 'w-full' };
  };

  const strength = passwordStrength();

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Registrasi Berhasil!</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{success}</p>
          <p className="text-gray-400 text-xs mt-3">
            Mengalihkan ke halaman login...
          </p>
          <div className="w-32 h-1 bg-gray-100 rounded-full mx-auto mt-4 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Kiri — ilustrasi */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-500 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-4">Bergabung dengan PinjemAja</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Daftarkan diri dengan email kampus dan mulai pinjam atau sewakan barangmu.
          </p>
          <div className="mt-10 space-y-6">
            {[
              { step: '1', title: 'Daftar dengan email .ac.id', desc: 'Verifikasi identitas kampusmu' },
              { step: '2', title: 'Lengkapi profil', desc: 'Tambahkan foto dan nomor WhatsApp' },
              { step: '3', title: 'Mulai bertransaksi', desc: 'Pinjam atau sewakan barangmu' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{item.title}</p>
                  <p className="text-blue-100 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanan — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800">PinjemAja</h1>
            <p className="text-gray-400 text-sm mt-1">Sharing Economy Platform</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Buat akun baru</h2>
          <p className="text-gray-400 text-sm mt-1 mb-8">
            Gunakan email kampus untuk mendaftar
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Nama lengkap kamu"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Kampus
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@mhs.dinus.ac.id"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  required
                />
              </div>
              {formData.email && !formData.email.endsWith('.ac.id') && (
                <p className="text-xs text-red-400 mt-1">Harus menggunakan email .ac.id</p>
              )}
              {formData.email && formData.email.endsWith('.ac.id') && (
                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                  <CheckCircle size={11} /> Email kampus valid
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Kekuatan password</span>
                    <span className="text-xs font-medium text-gray-600">{strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${strength.color} ${strength.width}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword2 ? 'text' : 'password'}
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.password2 && formData.password !== formData.password2 && (
                <p className="text-xs text-red-400 mt-1">Password tidak cocok</p>
              )}
              {formData.password2 && formData.password === formData.password2 && (
                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                  <CheckCircle size={11} /> Password cocok
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Daftar Sekarang <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-500 font-medium hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;