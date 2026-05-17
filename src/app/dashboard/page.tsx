'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FreeLimitBanner } from '@/components/lead-kits/FreeLimitBanner';
import { UpgradeBanner } from '@/components/lead-kits/UpgradeBanner';
import { SmartInput } from '@/components/ui/SmartInput';
import { useInputHistory } from '@/hooks/useInputHistory';

interface LeadKit {
  id: string;
  title: string;
  serviceName: string;
  targetIndustry: string;
  targetLocation: string;
  leadCount: number;
  status: string;
  unlockStatus: string;
  totalLeads: number;
  createdAt: string;
  _count: { leads: number };
}

interface UsageInfo {
  freeLeadsRemainingToday: number;
  kitLimitRemaining: number;
  currentPlan: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [kits, setKits] = useState<LeadKit[]>([]);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [form, setForm] = useState({
    serviceName: '',
    targetIndustry: '',
    targetLocation: '',
    leadCount: 10 as 10 | 50 | 100,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const userId = session?.user?.id;
  const serviceHistory = useInputHistory(userId, 'serviceName');
  const industryHistory = useInputHistory(userId, 'targetIndustry');
  const locationHistory = useInputHistory(userId, 'targetLocation');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchKits();
      fetchUsage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function fetchKits() {
    const res = await fetch('/api/lead-kits');
    if (res.ok) {
      const data = await res.json();
      setKits(data);
    }
  }

  async function fetchUsage() {
    const res = await fetch('/api/usage/me');
    if (res.ok) {
      const data = await res.json();
      setUsage(data);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (usage && usage.kitLimitRemaining <= 0 && usage.currentPlan === 'free') {
      setError('Bạn đã đạt giới hạn tạo kit miễn phí hôm nay (1 kit/ngày). Nâng cấp Pro để tạo không giới hạn.');
      return;
    }

    setCreating(true);

    try {
      const res = await fetch('/api/lead-kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Tạo kit thất bại');
      } else {
        serviceHistory.add(form.serviceName);
        industryHistory.add(form.targetIndustry);
        locationHistory.add(form.targetLocation);
        router.push(`/dashboard/lead-kits/${data.id}/processing`);
      }
    } catch {
      setError('Đã có lỗi xảy ra');
    } finally {
      setCreating(false);
    }
  }

  if (status === 'loading') {
    return <div className="p-8">Đang tải...</div>;
  }

  const isPro = usage?.currentPlan === 'pro' || usage?.currentPlan === 'agency';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">LeadKit AI</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session?.user?.name || session?.user?.email}</span>
              {usage && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isPro ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isPro ? 'Pro' : 'Free'}
                </span>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isPro && usage && <FreeLimitBanner remaining={usage.freeLeadsRemainingToday} />}
        {!isPro && <UpgradeBanner />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form tạo kit */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Tạo Lead Kit mới</h2>
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <SmartInput
                  label="Dịch vụ của bạn"
                  placeholder="Ví dụ: Thiết kế website"
                  required
                  value={form.serviceName}
                  onChange={(v) => setForm((prev) => ({ ...prev, serviceName: v }))}
                  history={serviceHistory.history}
                  onRemoveHistory={serviceHistory.remove}
                />
                <SmartInput
                  label="Ngành mục tiêu"
                  placeholder="Ví dụ: Spa"
                  required
                  value={form.targetIndustry}
                  onChange={(v) => setForm((prev) => ({ ...prev, targetIndustry: v }))}
                  history={industryHistory.history}
                  onRemoveHistory={industryHistory.remove}
                />
                <SmartInput
                  label="Địa điểm"
                  placeholder="Ví dụ: Quận 1, TP.HCM"
                  required
                  value={form.targetLocation}
                  onChange={(v) => setForm((prev) => ({ ...prev, targetLocation: v }))}
                  history={locationHistory.history}
                  onRemoveHistory={locationHistory.remove}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số lượng leads</label>
                  <select
                    value={form.leadCount}
                    onChange={(e) => setForm({ ...form, leadCount: Number(e.target.value) as 10 | 50 | 100 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={10}>10 leads (39.000đ)</option>
                    <option value={50}>50 leads (39.000đ)</option>
                    <option value={100}>100 leads (69.000đ)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Tìm leads'}
                </button>
              </form>
            </div>
          </div>

          {/* Danh sách kit */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Lead Kits của bạn</h2>
              {kits.length === 0 ? (
                <p className="text-gray-500">Chưa có lead kit nào. Tạo kit đầu tiên!</p>
              ) : (
                <div className="space-y-4">
                  {kits.map((kit) => (
                    <Link
                      key={kit.id}
                      href={`/dashboard/lead-kits/${kit.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{kit.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {kit.serviceName} · {kit.targetIndustry} · {kit.targetLocation}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                kit.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : kit.status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {kit.status === 'completed'
                                ? 'Hoàn thành'
                                : kit.status === 'processing'
                                ? 'Đang xử lý'
                                : 'Chờ xử lý'}
                            </span>
                            <span className="text-gray-500">{kit._count.leads} leads</span>
                            {kit.unlockStatus === 'unlocked' ? (
                              <span className="text-green-600 text-xs">✓ Đã mở khóa</span>
                            ) : (
                              <span className="text-orange-600 text-xs">🔒 Chưa mở khóa</span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(kit.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
