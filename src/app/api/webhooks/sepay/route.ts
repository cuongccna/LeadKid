import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseTransferContent, isValidWebhookSecret, SePayWebhookPayload } from '@/lib/payments/sepay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('X-Webhook-Secret');
    const expected = process.env.SEPAY_WEBHOOK_SECRET;

    if (!secret || !expected || !isValidWebhookSecret(secret, expected)) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    const payload: SePayWebhookPayload = await req.json();

    // Only process incoming transfers
    if (payload.transferType !== 'in') {
      return NextResponse.json({ status: 'ignored', reason: 'not_incoming' });
    }

    // Parse payment code from transfer content
    const { paymentCode } = parseTransferContent(payload.content);
    if (!paymentCode) {
      return NextResponse.json({ status: 'ignored', reason: 'no_payment_code' });
    }

    // Idempotency check
    const existing = await prisma.payment.findFirst({
      where: {
        providerPayload: {
          path: ['referenceCode'],
          equals: payload.referenceCode,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ status: 'already_processed' });
    }

    // Find payment by code
    const payment = await prisma.payment.findUnique({
      where: { paymentCode },
      include: { leadKit: true },
    });

    if (!payment) {
      return NextResponse.json({ status: 'payment_not_found' }, { status: 404 });
    }

    if (payment.status === 'paid') {
      return NextResponse.json({ status: 'already_paid' });
    }

    // Calculate paid amount (cumulative)
    const newPaidAmount = payment.paidAmountVnd + payload.transferAmount;
    const isFullyPaid = newPaidAmount >= payment.amountVnd;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: isFullyPaid ? 'paid' : 'pending',
        paidAmountVnd: newPaidAmount,
        remainingAmountVnd: Math.max(0, payment.amountVnd - newPaidAmount),
        paidAt: isFullyPaid ? new Date() : payment.paidAt,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        providerPayload: payload as any,
      },
    });

    // Process based on payment type
    if (isFullyPaid) {
      if (payment.paymentType === 'pro_monthly') {
        // Upgrade user to Pro
        await prisma.user.update({
          where: { id: payment.userId },
          data: { role: 'pro' },
        });
      } else if (payment.leadKitId) {
        // Unlock kit
        await prisma.leadKit.update({
          where: { id: payment.leadKitId },
          data: { unlockStatus: 'unlocked' },
        });
      }
    }

    return NextResponse.json({
      status: isFullyPaid ? 'paid_and_unlocked' : 'partial_payment',
      paymentId: payment.id,
      paidAmount: newPaidAmount,
      requiredAmount: payment.amountVnd,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
