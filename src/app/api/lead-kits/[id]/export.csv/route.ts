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

    // Check access: unlocked OR Pro user
    const isPro = session.user.role === 'pro' || session.user.role === 'agency';
    if (kit.unlockStatus !== 'unlocked' && !isPro) {
      return NextResponse.json(
        { error: 'Kit not unlocked', upgradeUrl: '/dashboard/upgrade' },
        { status: 403 }
      );
    }

    const columns = [
      'Tên công ty',
      'SĐT',
      'Pain Summary',
      'Script',
      'Địa chỉ',
      'Website',
      'Google Maps',
      'Trạng thái',
    ];

    const rows = kit.leads.map((lead) => [
      lead.companyName,
      lead.phone || '',
      lead.painSummary || '',
      lead.scriptText || '',
      lead.formattedAddress || '',
      lead.websiteUrl || '',
      lead.googleMapsUri || '',
      '', // Blank status for Mini-CRM
    ]);

    // UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csv = BOM + [
      columns,
      ...rows,
    ]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const filename = `leadkit-${kit.targetIndustry}-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
