import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Admin — Reports — LeadKit AI',
};

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const reports = await prisma.leadReport.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { email: true } },
      lead: { select: { companyName: true, phone: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Admin — Lead Reports</h1>
            <a href="/admin/payments" className="text-sm text-indigo-600 hover:text-indigo-500">
              ← Payments
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Công ty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.lead?.companyName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.lead?.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    {(r.reportReasons as string[]).map((reason) => (
                      <span key={reason} className="inline-block mr-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                        {reason}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.note || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
