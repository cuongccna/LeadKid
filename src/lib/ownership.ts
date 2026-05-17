import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error('UNAUTHORIZED');
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function assertOwnsLeadKit(kitId: string, userId: string) {
  const kit = await prisma.leadKit.findFirst({
    where: { id: kitId, userId },
    include: { leads: true },
  });
  if (!kit) {
    const error = new Error('NOT_FOUND') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }
  return kit;
}
