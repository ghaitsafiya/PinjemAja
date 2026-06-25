import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import {
  Package, Shield, Star, Clock,
  ArrowRight, Search, ArrowLeftRight,
  CheckCircle, MapPin, Bell
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Search,
      title: 'Cari Barang dengan Mudah',
      desc: 'Temukan barang yang kamu butuhkan dari sesama mahasiswa di kampusmu, lengkap dengan filter kategori, harga, dan lokasi terdekat.',
    },
    {
      icon: Shield,
      title: 'Dilindungi Deposit Jaminan',
      desc: 'Setiap transaksi dilindungi sistem deposit yang dikembalikan penuh setelah barang dikembalikan dalam kondisi baik.',
    },
    {
      icon: ArrowLeftRight,
      title: 'Transaksi Transparan',
      desc: 'Pantau status peminjaman secara real-time, dari pengajuan, pembayaran, hingga pengembalian barang.',
    },
    {
      icon: Star,
      title: 'Rating & Ulasan',
      desc: 'Sistem rating dua arah membantu membangun kepercayaan antar pengguna di lingkungan kampus.',
    },
    {
      icon: Bell,
      title: 'Notifikasi Otomatis',
      desc: 'Dapatkan pengingat otomatis sebelum jatuh tempo pengembalian, sehingga tidak ada lagi keterlambatan.',
    },
    {
      icon: MapPin,
      title: 'Lokasi Terdekat',
      desc: 'Lihat jarak barang dari lokasimu sehingga lebih mudah mengatur waktu pengambilan dan pengembalian.',
    },
  ];

  const steps = [
    { num: '1', title: 'Daftar dengan Email Kampus', desc: 'Gunakan email .ac.id untuk verifikasi identitas mahasiswa.' },
    { num: '2', title: 'Cari atau Tawarkan Barang', desc: 'Pinjam barang yang kamu butuhkan atau sewakan barangmu.' },
    { num: '3', title: 'Transaksi Aman', desc: 'Bayar, ambil barang, dan kembalikan sesuai jadwal.' },
    { num: '4', title: 'Beri Ulasan', desc: 'Bangun reputasi baik di komunitas kampus.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size={36} />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-800 transition px-4 py-2"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            Platform Sharing Economy Berbasis Kampus
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
            Pinjam dan Sewakan Barang dengan Mudah,
            <span className="text-blue-600"> Sesama Mahasiswa</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg mt-5 leading-relaxed">
            PinjemAja menghubungkan mahasiswa untuk saling pinjam-meminjam barang
            sehari-hari secara aman, transparan, dan terpercaya — dari buku, alat elektronik,
            hingga peralatan kuliah lainnya.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Mulai Sekarang <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              Sudah Punya Akun
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Khusus untuk mahasiswa dengan email kampus (.ac.id)
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-gray-800">Mengapa PinjemAja?</h2>
          <p className="text-gray-400 text-sm mt-2">
            Dirancang khusus untuk kebutuhan mahasiswa di lingkungan kampus
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3">
                <f.icon size={20} />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">{f.title}</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-gray-800">Cara Kerja</h2>
          <p className="text-gray-400 text-sm mt-2">
            Empat langkah sederhana untuk mulai pinjam-meminjam
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative">
              <div className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-bold mb-3">
                {s.num}
              </div>
              <h3 className="text-sm font-semibold text-gray-800">{s.title}</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Deposit info */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 md:p-10 text-center max-w-3xl mx-auto">
          <Shield size={32} className="text-blue-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800">Bagaimana Deposit Bekerja?</h2>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            Deposit adalah jaminan yang ditahan sementara selama masa peminjaman.
            Setelah barang dikembalikan dalam kondisi baik, deposit akan{' '}
            <strong className="text-gray-700">dikembalikan penuh</strong> kepada penyewa.
            Sistem ini melindungi penyedia dari risiko kerusakan atau kehilangan barang,
            sekaligus memastikan biaya peminjaman tetap masuk akal.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Siap Bergabung?</h2>
        <p className="text-gray-400 text-sm mt-2 mb-6">
          Daftar sekarang dengan email kampusmu dan mulai pinjam-meminjam dengan aman
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          Daftar Sekarang <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-gray-400">
          © 2026 PinjemAja — Platform Sharing Economy Berbasis Kampus
        </div>
      </footer>
    </div>
  );
};

export default Landing;