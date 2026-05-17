'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PainSignalBadge } from '@/components/lead-kits/PainSignalBadge';
import { PaymentModal } from '@/components/lead-kits/PaymentModal';
import { FreeLimitBanner } from '@/components/lead-kits/FreeLimitBanner';
import { ScriptCopyButton } from '@/components/lead-kits/ScriptCopyButton';
import { ZaloDeepLink } from '@/components/lead-kits/ZaloDeepLink';
import { ExportButton } from '@/components/lead-kits/ExportButton';
import { showToast } from '@/components/ui/Toast';

interface Lead {
  id: string;
  companyName: string;
  formattedAddress: string | null;
  phone: string | null;
  websiteUrl: string | null;
  googleMapsUri: string | null;
  painSignals: string[];
  painSummary: string | null;
  scriptText: string | null;
  isViewed: boolean;
  isFreePreview: boolean;
  rating: string | null;
  userRatingCount: number | null;
  businessStatus: string | null;
}

interface LeadKitDetail {
  id: string;
  title: string;
  status: string;
  unlockStatus: string;
  totalLeads: number;
  painSignalsSummary: { signal: string; count: number }[];
  leads: Lead[];
}

/* ─── Helpers ─── */

function formatAddress(raw: string | null): string {
  if (!raw) return '—';
  try {
    const obj = JSON.parse(raw);
    const parts: string[] = [];
    const seen = new Set<string>();

    const add = (val: string | undefined) => {
      if (!val) return;
      const trimmed = val.trim().replace(/^,\s*|\s*,$/g, '');
      if (!trimmed || seen.has(trimmed.toLowerCase())) return;
      seen.add(trimmed.toLowerCase());
      parts.push(trimmed);
    };

    add(obj.street);
    add(obj.borough);
    add(obj.city);
    if (obj.state) {
      // Nếu state chỉ là sự kết hợp của các phần đã có thì bỏ qua
      const stateLower = obj.state.toLowerCase();
      const alreadyCovered = parts.some((p) => stateLower.includes(p.toLowerCase()));
      if (!alreadyCovered) add(obj.state);
    }
    if (obj.country && obj.country !== 'VN') add(obj.country);

    return parts.join(', ') || '—';
  } catch {
    // Nếu không phải JSON thì trả về nguyên bản
    return raw || '—';
  }
}

/* formatPhone helper — can be enabled when phone formatting is needed */
// function formatPhone(phone: string | null): string { return phone || '—'; }

function RatingStars({ rating, count }: { rating: string | null; count: number | null }) {
  if (!rating) return null;
  const stars = Math.round(parseFloat(rating));
  return (
    <div className="flex items-center gap-1 text-xs text-amber-600">
      <span>{'⭐'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
      <span className="text-gray-400">({count ?? 0} đánh giá)</span>
    </div>
  );
}

/* ─── Components ─── */

function LeadInfoRow({ icon, label, children, href }: {
  icon: string;
  label: string;
  children: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-2">
      <span className="text-base mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <div className="text-sm text-gray-700 mt-0.5">{children}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 rounded transition">
        {content}
      </a>
    );
  }
  return content;
}

function ActionPill({
  icon, label, variant, onClick, href,
}: {
  icon: string;
  label: string;
  variant: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  href?: string;
}) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer';
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white',
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${styles[variant]}`}>
        <span>{icon}</span> {label}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      <span>{icon}</span> {label}
    </button>
  );
}

/* ─── Page ─── */

export default function LeadKitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [kit, setKit] = useState<LeadKitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [freeRemaining, setFreeRemaining] = useState(5);
  const [paymentModal, setPaymentModal] = useState<{
    paymentCode: string;
    amountVnd: number;
    qrUrl: string;
  } | null>(null);
  const [viewedLeads, setViewedLeads] = useState<Record<string, {
    phone: string | null;
    scriptText: string | null;
    painSignals: string[];
    painSummary: string | null;
    freeLeadsRemaining?: number;
  }>>({});
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetchKit();
    fetchUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchKit() {
    try {
      const res = await fetch(`/api/lead-kits/${id}`);
      if (!res.ok) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      setKit(data);
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsage() {
    try {
      const res = await fetch('/api/usage/me');
      if (res.ok) {
        const data = await res.json();
        setFreeRemaining(data.freeLeadsRemainingToday);
        setIsPro(data.currentPlan === 'pro' || data.currentPlan === 'agency');
      }
    } catch {
      // ignore
    }
  }

  async function handleUnlock() {
    const res = await fetch(`/api/lead-kits/${id}/unlock`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setPaymentModal(data);
    }
  }

  async function handleViewLead(leadId: string) {
    const res = await fetch(`/api/leads/${leadId}/view`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setViewedLeads((prev) => ({ ...prev, [leadId]: data }));
      setFreeRemaining(data.freeLeadsRemaining ?? freeRemaining - 1);
    } else if (res.status === 403) {
      const data = await res.json();
      if (data.error === 'FREE_LIMIT_REACHED') {
        showToast(data.message, 'info');
      } else if (data.error === 'LOCKED') {
        handleUnlock();
      }
    }
  }

  async function handleRegenerateScript() {
    if (!confirm('Bạn muốn tạo lại script AI cho tất cả leads? (Giới hạn 2 lần/kit cho Pro)')) return;
    const res = await fetch(`/api/lead-kits/${id}/regenerate-script`, { method: 'POST' });
    if (res.ok) {
      showToast('Script đã được tạo lại!', 'success');
      fetchKit();
    } else {
      const data = await res.json();
      showToast(data.error || 'Thất bại', 'error');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Đang tải dữ liệu leads...</p>
        </div>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-4xl mb-2">🔍</p>
          <p className="text-gray-500">Không tìm thấy Lead Kit</p>
          <Link href="/dashboard" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isUnlocked = kit.unlockStatus === 'unlocked';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/dashboard"
                className="shrink-0 text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
                title="Quay lại"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">{kit.title}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full font-medium ${
                    kit.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {kit.status === 'completed' ? '✓ Hoàn thành' : '⏳ Đang xử lý'}
                  </span>
                  <span>· {kit.totalLeads} leads</span>
                  {!isUnlocked && (
                    <span className="text-orange-600 font-medium">· 🔒 Chưa mở khóa</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ExportButton kitId={kit.id} />
              {isPro && (
                <button
                  onClick={handleRegenerateScript}
                  className="px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  ✨ Tạo lại AI
                </button>
              )}
              {!isUnlocked && (
                <button
                  onClick={handleUnlock}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition"
                >
                  🔓 Mở khóa
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {!isUnlocked && !isPro && <FreeLimitBanner remaining={freeRemaining} />}

        {/* Pain Signals Summary */}
        {kit.painSignalsSummary && kit.painSignalsSummary.length > 0 && (
          <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🎯</span> Cơ hội tiếp cận nổi bật
            </h3>
            <div className="flex flex-wrap gap-2">
              {kit.painSignalsSummary.map((item) => {
                const labelMap: Record<string, string> = {
                  no_website: 'Chưa có website → cơ hội thiết kế',
                  no_zalo_chat: 'Chưa có Zalo chat → cơ hội tư vấn',
                  no_booking: 'Chưa có đặt lịch online → cơ hội tích hợp',
                  slow_website: 'Website chậm → cơ hội tối ưu',
                };
                const colors: Record<string, string> = {
                  no_website: 'bg-red-50 text-red-700 border-red-100',
                  no_zalo_chat: 'bg-orange-50 text-orange-700 border-orange-100',
                  no_booking: 'bg-blue-50 text-blue-700 border-blue-100',
                  slow_website: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                };
                return (
                  <span
                    key={item.signal}
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      colors[item.signal] || 'bg-gray-50 text-gray-700 border-gray-100'
                    }`}
                  >
                    {labelMap[item.signal] || item.signal}
                    <span className="ml-1.5 opacity-70 font-bold">{item.count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Mobile: Lead Cards ─── */}
        <div className="block sm:hidden space-y-4">
          {kit.leads.map((lead) => {
            const viewed = viewedLeads[lead.id];
            const canView = isUnlocked || isPro || lead.isFreePreview;
            const showData = viewed || canView;
            const addr = formatAddress(lead.formattedAddress);

            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base leading-snug">
                        {lead.companyName}
                      </h3>
                      <RatingStars rating={lead.rating} count={lead.userRatingCount} />
                    </div>
                    {lead.isFreePreview && (
                      <span className="shrink-0 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Miễn phí
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <PainSignalBadge signals={lead.painSignals} />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Địa chỉ */}
                  <LeadInfoRow icon="📍" label="Địa chỉ">
                    {addr}
                  </LeadInfoRow>

                  {/* Trạng thái kinh doanh */}
                  {lead.businessStatus && (
                    <LeadInfoRow icon="🏪" label="Trạng thái">
                      <span className="capitalize">{lead.businessStatus}</span>
                    </LeadInfoRow>
                  )}

                  {/* Số điện thoại */}
                  {showData && viewed ? (
                    <LeadInfoRow icon="📱" label="Số điện thoại">
                      {viewed.phone ? (
                        <a
                          href={`tel:${viewed.phone.replace(/\s/g, '')}`}
                          className="text-indigo-700 font-semibold hover:underline"
                        >
                          {viewed.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Không có số điện thoại</span>
                      )}
                    </LeadInfoRow>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5 shrink-0">📱</span>
                      <div>
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Số điện thoại</p>
                        <button
                          onClick={() => handleViewLead(lead.id)}
                          className="text-sm text-indigo-600 font-medium mt-0.5 inline-flex items-center gap-1"
                        >
                          {canView ? '👆 Nhấn để xem SĐT' : '🔒 Mở khóa để xem SĐT'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {lead.websiteUrl && (
                    <LeadInfoRow
                      icon="🌐"
                      label="Website"
                      href={lead.websiteUrl}
                    >
                      <span className="text-indigo-600 hover:underline truncate block max-w-[250px]">
                        {lead.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </span>
                    </LeadInfoRow>
                  )}

                  {/* Google Maps */}
                  {lead.googleMapsUri && (
                    <LeadInfoRow
                      icon="🗺️"
                      label="Xem trên bản đồ"
                      href={lead.googleMapsUri}
                    >
                      <span className="text-indigo-600 hover:underline">Mở Google Maps →</span>
                    </LeadInfoRow>
                  )}

                  {/* Pain Summary */}
                  {showData && viewed?.painSummary && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">💡 Lý do nên liên hệ</p>
                      <p className="text-sm text-amber-900">{viewed.painSummary}</p>
                    </div>
                  )}

                  {/* Script AI */}
                  {showData && viewed?.scriptText && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                      <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">💬 Lời chào gợi ý</p>
                      <p className="text-sm text-indigo-900 italic leading-relaxed">&ldquo;{viewed.scriptText}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                {showData && viewed && (
                  <div className="px-4 pb-4 flex flex-wrap gap-2">
                    <ScriptCopyButton script={viewed.scriptText} />
                    <ZaloDeepLink phone={viewed.phone} script={viewed.scriptText} />
                    {lead.googleMapsUri && (
                      <ActionPill
                        icon="🗺️"
                        label="Xem Maps"
                        variant="outline"
                        href={lead.googleMapsUri}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── Desktop: Cards Grid ─── */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kit.leads.map((lead) => {
            const viewed = viewedLeads[lead.id];
            const canView = isUnlocked || isPro || lead.isFreePreview;
            const showData = viewed || canView;
            const addr = formatAddress(lead.formattedAddress);

            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 leading-snug truncate" title={lead.companyName}>
                        {lead.companyName}
                      </h3>
                      <RatingStars rating={lead.rating} count={lead.userRatingCount} />
                    </div>
                    {lead.isFreePreview && (
                      <span className="shrink-0 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase">
                        Miễn phí
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <PainSignalBadge signals={lead.painSignals} />
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3 flex-1">
                  <LeadInfoRow icon="📍" label="Địa chỉ">
                    <span className="line-clamp-2">{addr}</span>
                  </LeadInfoRow>

                  {showData && viewed ? (
                    <LeadInfoRow icon="📱" label="Số điện thoại">
                      {viewed.phone ? (
                        <a
                          href={`tel:${viewed.phone.replace(/\s/g, '')}`}
                          className="text-indigo-700 font-semibold hover:underline"
                        >
                          {viewed.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Không có số điện thoại</span>
                      )}
                    </LeadInfoRow>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5 shrink-0">📱</span>
                      <div>
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Số điện thoại</p>
                        <button
                          onClick={() => handleViewLead(lead.id)}
                          className="text-sm text-indigo-600 font-medium mt-0.5 inline-flex items-center gap-1 hover:underline"
                        >
                          {canView ? '👆 Nhấn để xem SĐT' : '🔒 Mở khóa để xem SĐT'}
                        </button>
                      </div>
                    </div>
                  )}

                  {lead.websiteUrl && (
                    <LeadInfoRow icon="🌐" label="Website" href={lead.websiteUrl}>
                      <span className="text-indigo-600 hover:underline truncate block">
                        {lead.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </span>
                    </LeadInfoRow>
                  )}

                  {showData && viewed?.painSummary && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">💡 Lý do nên liên hệ</p>
                      <p className="text-sm text-amber-900">{viewed.painSummary}</p>
                    </div>
                  )}

                  {showData && viewed?.scriptText && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                      <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">💬 Lời chào gợi ý</p>
                      <p className="text-sm text-indigo-900 italic leading-relaxed line-clamp-4">&ldquo;{viewed.scriptText}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {showData && viewed && (
                  <div className="px-4 pb-4 flex flex-wrap gap-2">
                    <ScriptCopyButton script={viewed.scriptText} />
                    <ZaloDeepLink phone={viewed.phone} script={viewed.scriptText} />
                    {lead.googleMapsUri && (
                      <ActionPill icon="🗺️" label="Maps" variant="outline" href={lead.googleMapsUri} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {paymentModal && (
        <PaymentModal
          paymentCode={paymentModal.paymentCode}
          amountVnd={paymentModal.amountVnd}
          qrUrl={paymentModal.qrUrl}
          onClose={() => setPaymentModal(null)}
          onPaid={() => {
            setPaymentModal(null);
            fetchKit();
          }}
        />
      )}
    </div>
  );
}
