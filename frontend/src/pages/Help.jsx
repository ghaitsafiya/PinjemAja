import React, { useState } from 'react';
import {
  HelpCircle, ChevronDown, ChevronUp,
  MessageCircle, Mail, BookOpen, Search
} from 'lucide-react';

const faqs = [
  {
    q: 'Bagaimana cara mendaftar di PinjemAja?',
    a: 'Klik tombol "Daftar" dan masukkan email kampus (.ac.id) kamu. Sistem akan mengirim link verifikasi ke emailmu. Klik link tersebut untuk mengaktifkan akun.'
  },
  {
    q: 'Apa itu deposit jaminan?',
    a: 'Deposit jaminan adalah dana yang ditahan selama masa peminjaman berlangsung. Dana ini akan dikembalikan penuh setelah penyedia mengkonfirmasi bahwa barang sudah dikembalikan dalam kondisi baik.'
  },
  {
    q: 'Bagaimana cara mengajukan peminjaman?',
    a: 'Cari barang yang kamu butuhkan, buka halaman detailnya, pilih tanggal mulai dan selesai, lalu klik "Ajukan Peminjaman". Penyedia akan mendapat notifikasi dan bisa menerima atau menolak pengajuanmu.'
  },
  {
    q: 'Apa yang terjadi jika barang rusak atau tidak dikembalikan?',
    a: 'Penyedia dapat melaporkan kondisi barang ke admin dengan bukti foto. Admin akan meninjau laporan dan dapat menggunakan deposit sebagai kompensasi atas kerusakan yang terjadi.'
  },
  {
    q: 'Berapa komisi yang dipotong platform?',
    a: 'PinjemAja memotong komisi sebesar 10% dari total biaya sewa. Komisi ini digunakan untuk menjaga operasional platform dan pengembangan fitur baru.'
  },
  {
    q: 'Bagaimana cara membatalkan peminjaman?',
    a: 'Kamu bisa membatalkan pengajuan selama statusnya masih "Menunggu Konfirmasi". Buka halaman Transaksi, temukan transaksi yang ingin dibatalkan, lalu klik tombol "Batalkan".'
  },
  {
    q: 'Apakah bisa menyewa dari kampus lain?',
    a: 'Saat ini PinjemAja berfokus pada ekosistem satu kampus untuk menjaga kepercayaan komunitas. Fitur lintas kampus sedang dalam pengembangan.'
  },
  {
    q: 'Bagaimana sistem rating bekerja?',
    a: 'Setelah transaksi selesai, baik penyewa maupun penyedia bisa saling memberikan rating bintang (1-5) dan ulasan. Rating ini membantu pengguna lain dalam mengambil keputusan.'
  },
];

const FaqItem = ({ faq }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <p className="text-sm font-medium text-gray-700 pr-4">{faq.q}</p>
        {open
          ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
};

const Help = () => {
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Pusat Bantuan</h1>
        <p className="text-sm text-gray-400 mt-1">Temukan jawaban atas pertanyaanmu</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pertanyaan..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: BookOpen, label: 'Panduan Mulai', color: 'bg-blue-50 text-blue-500' },
          { icon: MessageCircle, label: 'Chat Support', color: 'bg-emerald-50 text-emerald-500' },
          { icon: Mail, label: 'Email Kami', color: 'bg-amber-50 text-amber-500' },
        ].map((item, i) => (
          <button key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon size={18} />
            </div>
            <span className="text-xs font-medium text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
          <HelpCircle size={16} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">
            Pertanyaan Umum ({filtered.length})
          </h2>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Tidak ada hasil untuk "{search}"
          </div>
        ) : (
          filtered.map((faq, i) => <FaqItem key={i} faq={faq} />)
        )}
      </div>

      {/* Contact */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
        <p className="text-sm font-medium text-blue-700">Masih butuh bantuan?</p>
        <p className="text-xs text-blue-500 mt-1">
          Hubungi kami di <span className="font-medium">support@pinjemaja.id</span>
        </p>
      </div>
    </div>
  );
};

export default Help;