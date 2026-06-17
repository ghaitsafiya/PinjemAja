import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import {
  Shield, CreditCard, Building2,
  QrCode, CheckCircle, AlertCircle,
  ChevronLeft, Copy, Upload
} from 'lucide-react';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('qris');
  const [proof, setProof] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await API.get(`/transactions/${id}/`);
        setTransaction(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProof(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proof) {
      setError('Upload bukti pembayaran terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('transaction', id);
      formData.append('method', method);
      formData.append('amount', totalPayment);
      formData.append('payment_proof', proof);

      await API.post('/payments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Pembayaran berhasil dikirim! Menunggu konfirmasi.');
      setTimeout(() => navigate('/transactions'), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mengirim pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-6 bg-gray-100 rounded w-32" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6 text-center">
        <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400">Transaksi tidak ditemukan</p>
        <Link to="/transactions" className="text-blue-500 text-sm hover:underline mt-2 block">
          Kembali ke transaksi
        </Link>
      </div>
    );
  }

  if (transaction.status !== 'confirmed') {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <AlertCircle size={40} className="text-amber-400 mx-auto mb-3" />
        <p className="text-gray-700 font-medium">Transaksi belum dikonfirmasi</p>
        <p className="text-gray-400 text-sm mt-1">
          Pembayaran hanya bisa dilakukan setelah penyedia mengkonfirmasi pengajuan.
        </p>
        <Link
          to="/transactions"
          className="inline-block mt-4 text-blue-500 hover:underline text-sm"
        >
          Kembali ke transaksi →
        </Link>
      </div>
    );
  }

  const totalRent = parseFloat(transaction.total_rent);
  const depositAmount = parseFloat(transaction.deposit_amount);
  const totalPayment = totalRent + depositAmount;

  const bankDetails = {
    qris: { name: 'QRIS PinjemAja', code: 'Scan QR Code di bawah' },
    transfer: { name: 'BCA', code: '1234567890', holder: 'PinjemAja Platform' },
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition"
      >
        <ChevronLeft size={16} /> Kembali
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-1">Pembayaran</h1>
      <p className="text-sm text-gray-400 mb-6">
        Selesaikan pembayaran untuk memulai peminjaman
      </p>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <CheckCircle size={15} /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Ringkasan Transaksi */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Ringkasan Transaksi</h3>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Barang</span>
            <span className="font-medium text-gray-800">{transaction.listing_title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Durasi</span>
            <span className="font-medium text-gray-800">{transaction.duration_days} hari</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tanggal</span>
            <span className="font-medium text-gray-800">
              {transaction.start_date} → {transaction.end_date}
            </span>
          </div>
          <hr className="border-gray-50" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Biaya Sewa</span>
            <span className="font-medium text-gray-800">
              Rp {totalRent.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <Shield size={12} /> Deposit Jaminan
            </span>
            <span className="font-medium text-gray-800">
              Rp {depositAmount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Komisi Platform (10%)</span>
            <span className="font-medium text-gray-800">
              Rp {parseFloat(transaction.platform_fee).toLocaleString('id-ID')}
            </span>
          </div>
          <hr className="border-gray-100" />
          <div className="flex justify-between">
            <span className="font-semibold text-gray-800">Total Bayar</span>
            <span className="font-bold text-lg text-gray-900">
              Rp {totalPayment.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Form Pembayaran */}
      <form onSubmit={handleSubmit}>
        {/* Pilih Metode */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Metode Pembayaran</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'qris', label: 'QRIS', icon: QrCode, desc: 'Scan & bayar' },
              { value: 'transfer', label: 'Transfer Bank', icon: Building2, desc: 'BCA / Mandiri' },
            ].map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${
                  method === m.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  method === m.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400'
                }`}>
                  <m.icon size={20} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    method === m.value ? 'text-blue-700' : 'text-gray-700'
                  }`}>{m.label}</p>
                  <p className="text-xs text-gray-400">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Pembayaran */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            {method === 'qris' ? 'QR Code Pembayaran' : 'Rekening Tujuan'}
          </h3>

          {method === 'qris' ? (
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <div className="text-center">
                  <QrCode size={64} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">QR Code</p>
                  <p className="text-xs text-gray-300">Demo Mode</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Scan QR code menggunakan aplikasi mobile banking atau e-wallet
              </p>
              <p className="text-sm font-bold text-gray-800 mt-2">
                Rp {totalPayment.toLocaleString('id-ID')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Bank', value: bankDetails.transfer.name },
                { label: 'No. Rekening', value: bankDetails.transfer.code, copy: true },
                { label: 'Atas Nama', value: bankDetails.transfer.holder },
                { label: 'Jumlah Transfer', value: `Rp ${totalPayment.toLocaleString('id-ID')}`, copy: true },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                  {item.copy && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.value)}
                      className="text-blue-500 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Bukti */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            Upload Bukti Pembayaran
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Upload screenshot atau foto bukti pembayaran
          </p>

          {proofPreview ? (
            <div className="relative">
              <img
                src={proofPreview}
                alt="Bukti pembayaran"
                className="w-full max-h-64 object-contain rounded-xl border border-gray-100"
              />
              <button
                type="button"
                onClick={() => { setProof(null); setProofPreview(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition">
              <Upload size={24} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">Klik untuk upload</p>
              <p className="text-xs text-gray-300 mt-0.5">JPG, PNG (max 5MB)</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !proof}
          className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <><CreditCard size={16} /> Konfirmasi Pembayaran</>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Deposit akan dikembalikan setelah barang dikembalikan dalam kondisi baik
        </p>
      </form>
    </div>
  );
};

export default Payment;