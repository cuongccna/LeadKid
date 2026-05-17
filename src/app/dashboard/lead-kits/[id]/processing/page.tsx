'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface JobStatus {
  status: string;
  progressCurrent: number;
  progressTotal: number;
  currentStep: string | null;
}

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/lead-kits/${id}`);
        if (!res.ok) {
          setError('Không tìm thấy kit');
          return;
        }
        const kit = await res.json();

        if (kit.status === 'completed') {
          router.push(`/dashboard/lead-kits/${id}`);
          return;
        }

        // Find job
        const jobRes = await fetch(`/api/jobs?leadKitId=${id}`);
        if (jobRes.ok) {
          const jobs = await jobRes.json();
          const j = jobs.find((j: { leadKitId: string }) => j.leadKitId === id);
          if (j) setJob(j);
        }
      } catch {
        setError('Lỗi kết nối');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, router]);

  const progress = job && job.progressTotal > 0
    ? Math.round((job.progressCurrent / job.progressTotal) * 100)
    : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý...</h2>
        <p className="text-gray-500 mb-8">{job?.currentStep || 'Khởi tạo...'}</p>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">{progress}%</p>

        {error && (
          <p className="mt-4 text-red-600 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
