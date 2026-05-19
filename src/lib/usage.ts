import { prisma } from '@/lib/db';

export const FREE_DAILY_LEAD_VIEWS = 1;

export async function getFreeLeadsRemaining(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.usageLimit.findUnique({
    where: {
      userId_usageType_usageDate: {
        userId,
        usageType: 'free_lead_view',
        usageDate: today,
      },
    },
  });

  const used = usage?.count || 0;
  return Math.max(0, FREE_DAILY_LEAD_VIEWS - used);
}

export async function incrementLeadView(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.usageLimit.upsert({
    where: {
      userId_usageType_usageDate: {
        userId,
        usageType: 'free_lead_view',
        usageDate: today,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      usageType: 'free_lead_view',
      usageDate: today,
      count: 1,
    },
  });
}

export async function getKitLimitRemaining(userId: string): Promise<number> {
  // Free tier: 1 kit per day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await prisma.usageLimit.findUnique({
    where: {
      userId_usageType_usageDate: {
        userId,
        usageType: 'kit_created',
        usageDate: today,
      },
    },
  });

  const used = usage?.count || 0;
  return Math.max(0, 1 - used);
}

export async function incrementKitCreation(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.usageLimit.upsert({
    where: {
      userId_usageType_usageDate: {
        userId,
        usageType: 'kit_created',
        usageDate: today,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId,
      usageType: 'kit_created',
      usageDate: today,
      count: 1,
    },
  });
}
