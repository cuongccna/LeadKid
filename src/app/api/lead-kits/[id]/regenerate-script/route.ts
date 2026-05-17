import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getAIProvider } from '@/lib/ai';

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
      include: { leads: true },
    });

    if (!kit) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check regenerate limit (max 2 per kit for Pro)
    const isPro = session.user.role === 'pro' || session.user.role === 'agency';
    if (!isPro) {
      return NextResponse.json(
        { error: 'Pro required', upgradeUrl: '/dashboard/upgrade' },
        { status: 403 }
      );
    }

    const provider = getAIProvider(true);

    // Regenerate scripts for all leads
    for (const lead of kit.leads) {
      const script = await provider.generateScript({
        companyName: lead.companyName,
        painSummary: lead.painSummary,
        serviceName: kit.serviceName,
        industry: kit.targetIndustry,
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: { scriptText: script },
      });
    }

    return NextResponse.json({ success: true, message: 'Scripts regenerated' });
  } catch (error) {
    console.error('Regenerate script error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
