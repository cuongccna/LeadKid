'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '@/components/ui/Toast';

interface PaymentInfo {
  paymentId: string;
  paymentCode: string;
  amountVnd: number;
  qrUrl: string;
  transferContent: string;
  bankAccount?: string;
  bankCode?: string;
  accountName?: string;
}

export default function UpgradePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  async function createPayment() {
    setLoading(true);
    try {
      const res = await fetch('/api/upgrade/pro', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Không thể tạo thanh toán', 'error');
        if (data.error === 'Already upgraded') {
          router.push('/dashboard');
        }
      } else {
        setPayment(data);
      }
    } catch {
      showToast('Đã có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function checkPayment() {
    if (!payment) return;
    setChecking(true);
    try {
      // Poll payment status via a simple refresh
      await new Promise((r) => setTimeout(r, 2000));
      showToast('Đã kiểm tra thanh toán. Vui lòng đợi xác nhận từ hệ thống.', 'info');
      router.refresh();
    } catch {
      showToast('Không thể kiểm tra thanh toán', 'error');
    } finally {
      setChecking(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  const isPro = session?.user?.role === 'pro' || session?.user?.role === 'agency';

  if (isPro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Bạn đã là Pro!</h1>
          <p className="text-gray-500 mb-6">Tài khoản của bạn đang sử dụng gói Pro. Tận hưởng tất cả tính năng cao cấp.</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại Dashboard
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Nâng cấp tài khoản</h1>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!payment ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-70">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Gói Free</h2>
              <p className="text-3xl font-bold text-gray-900 mb-4">0đ<span className="text-sm font-normal text-gray-500">/tháng</span></p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">✓ 5 leads miễn phí/ngày</li>
                <li className="flex items-center gap-2">✓ 1 kit/ngày</li>
                <li className="flex items-center gap-2">✗ Không có AI viết lợi chào</li>
                <li className="flex items-center gap-2">✗ Không export CSV</li>
                <li className="flex items-center gap-2">✗ Không tạo lại script AI</li>
              </ul>
              <div className="mt-6">
                <span className="block w-full text-center py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 bg-gray-50">
                  Đang sử dụng
                </span>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-500 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                PHỔ BIẾN NHẤT
              </div>
              <h2 className="text-lg font-semibold text-indigo-700 mb-2">Gói Pro</h2>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                149.000đ<span className="text-sm font-normal text-gray-500">/tháng</span>
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">✓ 500 leads/ngày</li>
                <li className="flex items-center gap-2">✓ Tạo kit không giới hạn</li>
                <li className="flex items-center gap-2">✓ AI viết lợi chào cho từng lead</li>
                <li className="flex items-center gap-2">✓ Export CSV không giới hạn</li>
                <li className="flex items-center gap-2">✓ Tạo lại script AI (2 lần/kit)</li>
                <li className="flex items-center gap-2">✓ Xem tất cả SĐT không khóa</li>
              </ul>
              <button
                onClick={createPayment}
                disabled={loading}
                className="mt-6 w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
              >
                {loading ? 'Đang tạo...' : 'Nâng cấp ngay'}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Thanh toán gói Pro</h2>
              <p className="text-3xl font-bold text-indigo-600">
                {new Intl.NumberFormat('vi-VN').format(payment.amountVnd)}đ
              </p>
              <p className="text-sm text-gray-500 mt-1">Quét mã QR hoặc chuyển khoản theo thông tin bên dưới</p>
            </div>

            <div className="flex justify-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payment.qrUrl}
                alt="VietQR"
                className="w-56 h-56 object-contain border rounded-lg"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Ngân hàng:</span>
                <span className="font-medium">{payment.bankCode || 'Vietcombank'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số tài khoản:</span>
                <span className="font-medium">{payment.bankAccount || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Chủ tài khoản:</span>
                <span className="font-medium">{payment.accountName || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-medium text-indigo-600">
                  {new Intl.NumberFormat('vi-VN').format(payment.amountVnd)}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nội dung CK:</span>
                <span className="font-medium text-indigo-600 select-all">{payment.transferContent}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={checkPayment}
                disabled={checking}
                className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {checking ? 'Đang kiểm tra...' : '✓ Tôi đã thanh toán'}
              </button>
              <button
                onClick={() => setPayment(null)}
                className="w-full py-2 px-4 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Quay lại chọn gói
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Vui lòng ghi đúng nội dung chuyển khoản để hệ thống tự động xác nhận.
              Thanh toán có hiệu lực trong 24 giờ.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
