import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-2">
          <svg
            width="48"
            height="48"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="pinjemaja-grad-loading" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#2563EB" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="url(#pinjemaja-grad-loading)" />
            <rect x="7" y="20" width="11" height="11" rx="2.5" fill="white" fillOpacity="0.95" />
            <rect x="22" y="9" width="11" height="11" rx="2.5" fill="white" fillOpacity="0.95" />
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">PinjemAja</h1>
            <p className="text-sm text-gray-400 leading-tight tracking-wide">Sharing Economy Platform</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Memeriksa sesi...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
