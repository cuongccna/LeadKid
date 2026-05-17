import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
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

    return NextResponse.json(kit);
  } catch (error) {
    console.error('Get lead kit error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.leadKit.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete lead kit error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
