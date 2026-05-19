import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const reportSchema = z.object({
  reasons: z.array(z.string()).min(1),
  note: z.string().optional(),
});

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
    });

    if (!lead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const data = reportSchema.parse(body);

    // Create report
    await prisma.leadReport.create({
      data: {
        userId: session.user.id,
        leadId: lead.id,
        reportReasons: data.reasons,
        note: data.note,
      },
    });

    // Update phone verification status if wrong_phone reported
    if (data.reasons.includes('wrong_phone') || data.reasons.includes('Sai số điện thoại')) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { phoneVerificationStatus: 'reported_bad' },
      });
    }

    // Check if >= 2 reports for same phone, auto-suppress
    const reportCount = await prisma.leadReport.count({
      where: { lead: { phone: lead.phone } },
    });

    if (reportCount >= 2 && lead.phone) {
      // Auto-mark as reported_bad if 2+ reports
      await prisma.lead.updateMany({
        where: { phone: lead.phone },
        data: { phoneVerificationStatus: 'reported_bad' },
      });
    }

    return NextResponse.json({ success: true, message: 'Báo cáo đã được gửi' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Report lead error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
