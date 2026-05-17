import { PrismaClient } from '@prisma/client';
import { processLeadKit } from '../src/lib/processing/process-lead-kit';
import { workerPostJobDelay } from '../src/lib/ratelimit';

const prisma = new PrismaClient();
const WORKER_ID = `worker-${process.pid}`;
const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS) || 5000;
const LEASE_MINUTES = Number(process.env.JOB_LEASE_MINUTES) || 10;

async function claimJob() {
  const result = await prisma.$queryRaw<Array<any>>`
    UPDATE jobs
    SET status = 'running',
        locked_by = ${WORKER_ID},
        locked_at = NOW(),
        lease_expires_at = NOW() + INTERVAL '10 minutes',
        started_at = NOW()
    WHERE id = (
      SELECT id FROM jobs
      WHERE status = 'pending'
         OR (status = 'running' AND lease_expires_at < NOW())
      ORDER BY priority DESC, created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *;
  `;

  return result[0] || null;
}

async function completeJob(jobId: string, result: any) {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      result: result || {},
      lockedBy: null,
      leaseExpiresAt: null,
    },
  });
}

async function failJob(jobId: string, errorMessage: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'failed',
      errorMessage: errorMessage.slice(0, 500),
      completedAt: new Date(),
      lockedBy: null,
      leaseExpiresAt: null,
    },
  });
}

async function workerLoop() {
  console.log(`[${WORKER_ID}] Worker started`);

  while (true) {
    try {
      const job = await claimJob();

      if (!job) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        continue;
      }

      console.log(`[${WORKER_ID}] Processing job ${job.id} (type: ${job.type})`);

      if (job.type === 'process_lead_kit' && job.lead_kit_id) {
        await processLeadKit(job.id, job.lead_kit_id);
        console.log(`[${WORKER_ID}] Completed job ${job.id}`);
        await workerPostJobDelay();
      } else {
        await completeJob(job.id, { message: 'Unknown job type' });
      }
    } catch (err: any) {
      console.error(`[${WORKER_ID}] Job error:`, err);
      // Try to fail the last claimed job if possible
      try {
        const lastJob = await prisma.job.findFirst({
          where: { lockedBy: WORKER_ID, status: 'running' },
          orderBy: { lockedAt: 'desc' },
        });
        if (lastJob) {
          await failJob(lastJob.id, err.message || 'Unknown error');
        }
      } catch {
        // ignore
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

workerLoop().catch((err) => {
  console.error('Worker fatal error:', err);
  process.exit(1);
});
