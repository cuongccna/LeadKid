import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const noteSchema = z.object({
  note: z.string().max(1000),
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
    const data = noteSchema.parse(body);

    await prisma.leadStatus.upsert({
      where: {
        userId_leadId: {
          userId: session.user.id,
          leadId: lead.id,
        },
      },
      update: {
        note: data.note,
      },
      create: {
        userId: session.user.id,
        leadId: lead.id,
        status: 'not_contacted',
        note: data.note,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Update lead note error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
