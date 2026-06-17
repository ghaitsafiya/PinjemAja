import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import LoadingScreen from './components/common/LoadingScreen';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Transactions from './pages/Transactions';
import MyListings from './pages/MyListings';
import AddListing from './pages/AddListing';
import EditListing from './pages/EditListing';
import ProviderTransactions from './pages/ProviderTransactions';
import ReviewPage from './pages/ReviewPage';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Help from './pages/Help';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminReports from './pages/admin/AdminReports';
import Payment from './pages/Payment';
import Review from './pages/Review';
import Landing from './pages/Landing';

const App = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  const isAdmin = user.email === '111202314976@mhs.dinus.ac.id';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={isAdmin ? <Navigate to="/admin" /> : <Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id/review" element={<ReviewPage />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/my-listings/edit/:id" element={<EditListing />} />
            <Route path="/my-listings/add" element={<AddListing />} />
            <Route path="/manage-borrows" element={<ProviderTransactions />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/register" element={<Navigate to="/" />} />
            <Route path="*" element={
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-5xl font-bold text-gray-100">404</p>
                  <p className="text-gray-400 mt-2">Halaman tidak ditemukan</p>
                  <a href="/" className="text-blue-500 text-sm hover:underline mt-2 block">Kembali ke beranda</a>
                </div>
              </div>
            } />
            <Route path="/admin/listings" element={isAdmin ? <AdminListings /> : <Navigate to="/" />} />
            <Route path="/admin/transactions" element={isAdmin ? <AdminTransactions /> : <Navigate to="/" />} />
            <Route path="/admin/reports" element={isAdmin ? <AdminReports /> : <Navigate to="/" />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/transactions/:id/review" element={<Review />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;