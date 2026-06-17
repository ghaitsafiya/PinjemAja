import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import API from '../../services/api';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await API.get('/notifications/unread_count/');
        setUnreadCount(res.data.unread_count || 0);
      } catch (e) {
        console.error(e);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    // Listen event dari halaman Notifications
    window.addEventListener('notifications-updated', fetchUnreadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications-updated', fetchUnreadCount);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Kiri */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-gray-600"
        >
          <Menu size={22} />
        </button>
        <div className="lg:hidden">
          <Logo size={28} withText={false} />
        </div>
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, categories..."
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 w-72 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
          />
        </div>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-xl shadow-lg w-48 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Profil Saya
              </button>
              <button
                onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;