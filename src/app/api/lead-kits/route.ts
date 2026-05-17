import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkUserKitCooldown } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  serviceName: z.string().min(1),
  targetIndustry: z.string().min(1),
  targetLocation: z.string().min(1),
  leadCount: z.union([z.literal(10), z.literal(50), z.literal(100)]),
  sellerGoal: z.string().optional(),
  offerAngle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    // Check per-user cooldown
    const cooldown = await checkUserKitCooldown(session.user.id);
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error: 'RATE_LIMITED',
          message: `Vui lòng đợi ${Math.ceil(cooldown.remainingMs / 1000)} giây trước khi tạo kit tiếp theo.`,
          remainingMs: cooldown.remainingMs,
        },
        { status: 429 }
      );
    }

    const title = `${data.targetIndustry} - ${data.targetLocation}`;

    const kit = await prisma.leadKit.create({
      data: {
        userId: session.user.id,
        title,
        serviceName: data.serviceName,
        targetIndustry: data.targetIndustry,
        targetLocation: data.targetLocation,
        leadCount: data.leadCount,
        status: 'pending',
      },
    });

    // Enqueue job
    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        leadKitId: kit.id,
        type: 'process_lead_kit',
        status: 'pending',
        payload: {
          leadKitId: kit.id,
        },
      },
    });

    return NextResponse.json({ id: kit.id, status: kit.status, jobId: job.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create lead kit error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kits = await prisma.leadKit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json(kits);
  } catch (error) {
    console.error('Get lead kits error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
