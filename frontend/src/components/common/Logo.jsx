import React from 'react';

/**
 * Logo PinjemAja - ikon dua tangan saling memberi/bertukar barang
 * dibentuk dari shape geometris sederhana, bisa di-resize bebas.
 *
 * Props:
 *   size  - ukuran ikon dalam px (default 32)
 *   withText - tampilkan teks "PinjemAja" di samping ikon (default true)
 */
const Logo = ({ size = 32, withText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Lingkaran latar belakang gradient */}
        <defs>
          <linearGradient id="pinjemaja-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2563EB" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#pinjemaja-grad)" />

        {/* Dua kotak (box) saling bertukar - melambangkan pinjam-meminjam barang */}
        <rect x="7" y="20" width="11" height="11" rx="2.5" fill="white" fillOpacity="0.95" />
        <rect x="22" y="9" width="11" height="11" rx="2.5" fill="white" fillOpacity="0.95" />

        {/* Arrow loop menghubungkan kedua kotak - simbol siklus pinjam/kembali */}
        <path
          d="M18.5 23.5C18.5 23.5 21 17 25.5 16"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M23.5 14.7L25.8 15.8L24.9 18.2"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {withText && (
        <div>
          <h1 className="text-lg font-bold text-gray-800 leading-tight">PinjemAja</h1>
          <p className="text-xs text-gray-400 leading-tight">Sharing Economy Platform</p>
        </div>
      )}
    </div>
  );
};

export default Logo;