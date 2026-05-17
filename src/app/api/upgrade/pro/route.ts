import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculatePrice, generatePaymentCode } from '@/lib/payments/pricing';
import { getBankQRUrl } from '@/lib/payments/vietqr';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'pro' || user.role === 'agency') {
      return NextResponse.json({ error: 'Already upgraded' }, { status: 400 });
    }

    // Check for existing pending pro payment
    const existing = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        paymentType: 'pro_monthly',
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const qrUrl = getBankQRUrl({
        bankCode: process.env.SEPAY_BANK_CODE || '970436',
        accountNumber: process.env.SEPAY_BANK_ACCOUNT || '0000000000',
        amount: existing.amountVnd,
        description: existing.paymentCode,
        accountName: process.env.SEPAY_ACCOUNT_NAME || 'LEADKIT',
      });

      return NextResponse.json({
        paymentId: existing.id,
        paymentCode: existing.paymentCode,
        amountVnd: existing.amountVnd,
        qrUrl,
        transferContent: existing.paymentCode,
        bankAccount: process.env.SEPAY_BANK_ACCOUNT,
        bankCode: process.env.SEPAY_BANK_CODE,
        accountName: process.env.SEPAY_ACCOUNT_NAME,
      });
    }

    const amount = calculatePrice('pro_monthly');
    const paymentCode = generatePaymentCode();

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amountVnd: amount,
        paymentType: 'pro_monthly',
        paymentCode,
        transferContent: paymentCode,
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    const qrUrl = getBankQRUrl({
      bankCode: process.env.SEPAY_BANK_CODE || '970436',
      accountNumber: process.env.SEPAY_BANK_ACCOUNT || '0000000000',
      amount,
      description: paymentCode,
      accountName: process.env.SEPAY_ACCOUNT_NAME || 'LEADKIT',
    });

    return NextResponse.json({
      paymentId: payment.id,
      paymentCode,
      amountVnd: amount,
      qrUrl,
      transferContent: paymentCode,
      bankAccount: process.env.SEPAY_BANK_ACCOUNT,
      bankCode: process.env.SEPAY_BANK_CODE,
      accountName: process.env.SEPAY_ACCOUNT_NAME,
    });
  } catch (error) {
    console.error('Upgrade pro error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
