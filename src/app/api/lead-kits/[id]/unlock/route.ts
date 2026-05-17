import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculatePrice, generatePaymentCode } from '@/lib/payments/pricing';
import { getBankQRUrl } from '@/lib/payments/vietqr';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kit = await prisma.leadKit.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!kit) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (kit.unlockStatus === 'unlocked') {
      return NextResponse.json({ error: 'Already unlocked' }, { status: 400 });
    }

    const amount = calculatePrice(kit.leadCount as 10 | 50 | 100);
    const paymentCode = generatePaymentCode();

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        leadKitId: kit.id,
        amountVnd: amount,
        paymentCode,
        transferContent: paymentCode,
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    const qrUrl = getBankQRUrl({
      bankCode: process.env.SEPAY_BANK_CODE || '970436', // Default Vietcombank
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
    console.error('Unlock error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
