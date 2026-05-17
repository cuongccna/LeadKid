import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getFreeLeadsRemaining, getKitLimitRemaining } from '@/lib/usage';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [freeLeadsRemaining, kitLimitRemaining] = await Promise.all([
      getFreeLeadsRemaining(session.user.id),
      getKitLimitRemaining(session.user.id),
    ]);

    return NextResponse.json({
      freeLeadsRemainingToday: freeLeadsRemaining,
      kitLimitRemaining,
      currentPlan: session.user.role === 'pro' ? 'pro' : session.user.role === 'agency' ? 'agency' : 'free',
    });
  } catch (error) {
    console.error('Usage error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
