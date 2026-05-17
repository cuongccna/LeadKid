'use client';

import { useState } from 'react';

interface PaymentModalProps {
  paymentCode: string;
  amountVnd: number;
  qrUrl: string;
  bankAccount?: string;
  bankCode?: string;
  accountName?: string;
  onClose: () => void;
  onPaid: () => void;
}

export function PaymentModal({
  paymentCode,
  amountVnd,
  qrUrl,
  bankAccount,
  bankCode,
  accountName,
  onClose,
  onPaid,
}: PaymentModalProps) {
  const [checking, setChecking] = useState(false);

  async function checkPayment() {
    setChecking(true);
    // Poll payment status (simplified - in production use paymentId)
    await new Promise((r) => setTimeout(r, 2000));
    onPaid();
    setChecking(false);
  }

  const formattedAmount = new Intl.NumberFormat('vi-VN').format(amountVnd);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Thanh toán để mở khóa</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{formattedAmount}đ</p>
            <p className="text-sm text-gray-500 mt-1">Quét mã QR để thanh toán</p>
          </div>

          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="VietQR"
              className="w-48 h-48 object-contain border rounded-lg"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Ngân hàng:</span>
              <span className="font-medium">{bankCode || 'Vietcombank'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số tài khoản:</span>
              <span className="font-medium">{bankAccount || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Chủ tài khoản:</span>
              <span className="font-medium">{accountName || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nội dung CK:</span>
              <span className="font-medium text-indigo-600">{paymentCode}</span>
            </div>
          </div>

          <button
            onClick={checkPayment}
            disabled={checking}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {checking ? 'Đang kiểm tra...' : 'Tôi đã thanh toán'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Vui lòng ghi đúng nội dung chuyển khoản để hệ thống tự động xác nhận.
          </p>
        </div>
      </div>
    </div>
  );
}
