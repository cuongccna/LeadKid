import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getFreeLeadsRemaining, incrementLeadView, FREE_DAILY_LEAD_VIEWS } from '@/lib/usage';

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

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: { leadKit: true },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Pro/Agency users have unlimited access
    if (session.user.role === 'pro' || session.user.role === 'agency') {
      await prisma.lead.update({
        where: { id: params.id },
        data: { isViewed: true },
      });
      return NextResponse.json({
        phone: lead.phone,
        scriptText: lead.scriptText,
        painSignals: lead.painSignals,
        painSummary: lead.painSummary,
      });
    }

    // Kit must be unlocked or lead is free preview
    if (lead.leadKit?.unlockStatus !== 'unlocked' && !lead.isFreePreview) {
      return NextResponse.json(
        { error: 'LOCKED', upgradeUrl: '/dashboard/upgrade' },
        { status: 403 }
      );
    }

    // Check free limit for unlocked/preview leads
    const remaining = await getFreeLeadsRemaining(session.user.id);
    if (remaining <= 0 && !lead.isViewed) {
      return NextResponse.json(
        {
          error: 'FREE_LIMIT_REACHED',
          upgradeUrl: '/dashboard/upgrade',
          message: `Bạn đã xem ${FREE_DAILY_LEAD_VIEWS} leads hôm nay. Nâng cấp Pro để xem không giới hạn.`,
        },
        { status: 403 }
      );
    }

    // Increment view if not already viewed
    if (!lead.isViewed) {
      await incrementLeadView(session.user.id);
    }

    await prisma.lead.update({
      where: { id: params.id },
      data: { isViewed: true },
    });

    return NextResponse.json({
      phone: lead.phone,
      scriptText: lead.scriptText,
      painSignals: lead.painSignals,
      painSummary: lead.painSummary,
      freeLeadsRemaining: remaining - 1,
    });
  } catch (error) {
    console.error('View lead error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
