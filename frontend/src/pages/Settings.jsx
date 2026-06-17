import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  Bell, Shield, Smartphone,
  Globe, Moon, ChevronRight,
  CheckCircle, Sun
} from 'lucide-react';

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
      enabled ? 'bg-blue-500' : 'bg-gray-200'
    }`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
      enabled ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

const Settings = () => {
  const { settings, updateSetting } = useSettings();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const notifSections = [
    {
      key: 'notif_borrow',
      label: 'Pengajuan Peminjaman',
      desc: 'Notifikasi saat ada yang mengajukan pinjam barangmu'
    },
    {
      key: 'notif_return',
      label: 'Pengingat Pengembalian',
      desc: 'Notifikasi H-1 sebelum tanggal pengembalian'
    },
    {
      key: 'notif_payment',
      label: 'Konfirmasi Pembayaran',
      desc: 'Notifikasi saat pembayaran dikonfirmasi'
    },
    {
      key: 'notif_email',
      label: 'Notifikasi Email',
      desc: 'Kirim notifikasi juga ke email kampus'
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Atur preferensi akun kamu</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <CheckCircle size={15} /> Pengaturan berhasil disimpan!
        </div>
      )}

      <div className="space-y-4">
        {/* Notifikasi */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50 dark:border-gray-700">
            <Bell size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Notifikasi</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {notifSections.map(item => (
              <div key={item.key} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <ToggleSwitch
                  enabled={settings[item.key]}
                  onChange={(val) => updateSetting(item.key, val)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tampilan - Dark Mode */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50 dark:border-gray-700">
            {settings.dark_mode
              ? <Moon size={16} className="text-gray-400" />
              : <Sun size={16} className="text-gray-400" />
            }
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tampilan</h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {settings.dark_mode ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {settings.dark_mode
                    ? 'Tampilan gelap aktif'
                    : 'Tampilan terang aktif'
                  }
                </p>
              </div>
              <ToggleSwitch
                enabled={settings.dark_mode}
                onChange={(val) => updateSetting('dark_mode', val)}
              />
            </div>

            {/* Preview */}
            <div className={`mt-4 rounded-xl p-4 border transition-all ${
              settings.dark_mode
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gray-50 border-gray-100'
            }`}>
              <p className={`text-xs font-medium ${settings.dark_mode ? 'text-white' : 'text-gray-800'}`}>
                Preview Tampilan
              </p>
              <p className={`text-xs mt-1 ${settings.dark_mode ? 'text-gray-400' : 'text-gray-500'}`}>
                Begini tampilan platform dengan mode {settings.dark_mode ? 'gelap' : 'terang'}
              </p>
              <div className={`mt-2 h-2 rounded-full w-3/4 ${settings.dark_mode ? 'bg-blue-500' : 'bg-blue-400'}`} />
            </div>
          </div>
        </div>

        {/* Bahasa */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50 dark:border-gray-700">
            <Globe size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Bahasa</h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex gap-2">
              {[
                { label: '🇮🇩 Bahasa Indonesia', value: 'id' },
                { label: '🇬🇧 English', value: 'en' },
              ].map(lang => (
                <button
                  key={lang.value}
                  onClick={() => updateSetting('language', lang.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    settings.language === lang.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            {settings.language === 'en' && (
              <p className="text-xs text-amber-500 mt-2">
                ⚠️ English translation is coming soon
              </p>
            )}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50 dark:border-gray-700">
            <Smartphone size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tentang Aplikasi</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {[
              { label: 'Versi Aplikasi', value: '1.0.0' },
              { label: 'Kebijakan Privasi', value: '' },
              { label: 'Syarat & Ketentuan', value: '' },
              { label: 'Hubungi Kami', value: '' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                <p className="text-sm text-gray-700 dark:text-gray-200">{item.label}</p>
                <div className="flex items-center gap-1 text-gray-400">
                  {item.value && <span className="text-xs">{item.value}</span>}
                  {!item.value && <ChevronRight size={15} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

export default Settings;