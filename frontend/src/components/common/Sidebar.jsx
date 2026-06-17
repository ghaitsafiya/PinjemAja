import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import {
  LayoutDashboard, Package, ArrowLeftRight,
  Bell, Settings, HelpCircle, LogOut, X, ShoppingBag, ClipboardList
} from 'lucide-react';


const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.email === '111202314976@mhs.dinus.ac.id';

  const userMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingBag, label: 'Cari Barang', path: '/listings' },
    { icon: Package, label: 'Barang Saya', path: '/my-listings' },
    { icon: ArrowLeftRight, label: 'Transaksi Saya', path: '/transactions' },
    { icon: ClipboardList, label: 'Kelola Peminjaman', path: '/manage-borrows' },
    { icon: Bell, label: 'Notifikasi', path: '/notifications' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Kelola Listing', path: '/admin/listings' },
    { icon: ArrowLeftRight, label: 'Semua Transaksi', path: '/admin/transactions' },
    { icon: Bell, label: 'Laporan', path: '/admin/reports' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const bottomItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30
        flex flex-col transform transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Logo size={36}/>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Menu utama */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }
              `}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}

          <div className="pt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
              Settings
            </p>
            {bottomItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all"
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User info + logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.full_name?.split(' ')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.university_domain}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full mt-1"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;