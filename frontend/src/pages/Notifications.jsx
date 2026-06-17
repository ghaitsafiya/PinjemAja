import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Clock, CheckCircle,
  XCircle, ArrowLeftRight, Package, AlertCircle
} from 'lucide-react';

const notifConfig = {
  borrow_request: { icon: Package, color: 'bg-blue-50 text-blue-500' },
  confirmed: { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500' },
  rejected: { icon: XCircle, color: 'bg-red-50 text-red-500' },
  payment_received: { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500' },
  payment_uploaded: { icon: CheckCircle, color: 'bg-blue-50 text-blue-500' },
  return_reminder: { icon: Clock, color: 'bg-amber-50 text-amber-500' },
  completed: { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500' },
  deposit_returned: { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-500' },
  cancelled: { icon: XCircle, color: 'bg-gray-100 text-gray-400' },
  late_return: { icon: AlertCircle, color: 'bg-red-50 text-red-500' },
};

const timeAgo = (dateStr) => {
  const diff = (new Date() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
};

// Menentukan halaman tujuan berdasarkan tipe notifikasi
const getNotificationLink = (notif) => {
  const txId = notif.transaction;

  switch (notif.notification_type) {
    case 'borrow_request':
    case 'confirmed':
    case 'rejected':
    case 'cancelled':
    case 'late_return':
    case 'payment_uploaded':
    case 'payment_received':
    case 'return_reminder':
    case 'deposit_returned':
      return '/transactions';

    case 'completed':
      return txId ? `/transactions/${txId}/review` : '/transactions';

    default:
      return '/notifications';
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications/');
      setNotifications(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.post('/notifications/mark_all_read/');
      await fetchNotifications();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await API.post(`/notifications/${notif.id}/mark_read/`);
        setNotifications(prev =>
          prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        );
        window.dispatchEvent(new Event('notifications-updated'));
      } catch (e) {
        console.error(e);
      }
    }
    navigate(getNotificationLink(notif));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Notifikasi</h1>
          <p className="text-sm text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 bg-blue-50 px-4 py-2 rounded-xl transition font-medium"
          >
            <CheckCheck size={15} /> Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {[
          { label: 'Semua', value: 'all' },
          { label: `Belum Dibaca (${unreadCount})`, value: 'unread' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              filter === tab.value
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <Bell size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">
            {filter === 'unread' ? 'Tidak ada notifikasi belum dibaca' : 'Belum ada notifikasi'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const config = notifConfig[notif.notification_type] || {
              icon: Bell,
              color: 'bg-gray-100 text-gray-400'
            };
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex gap-3 p-4 rounded-2xl border transition cursor-pointer ${
                  notif.is_read
                    ? 'bg-white border-gray-100 hover:bg-gray-50'
                    : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-gray-300 mt-1.5">{timeAgo(notif.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;