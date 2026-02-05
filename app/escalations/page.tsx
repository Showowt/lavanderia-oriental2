export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabase';
import { PageHeader } from '@/components/layout/Header';
import { EscalationQueue } from '@/components/escalations/EscalationQueue';
import type { EscalationWithDetails } from '@/types';

async function getEscalations() {
  const { data, error } = await supabaseAdmin
    .from('escalations')
    .select(`
      *,
      conversation:conversations(
        *,
        customer:customers(*)
      )
    `)
    .in('status', ['pending', 'claimed'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching escalations:', error);
    return [];
  }

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return (data || []).sort((a, b) => {
    const priorityDiff =
      priorityOrder[a.priority as keyof typeof priorityOrder] -
      priorityOrder[b.priority as keyof typeof priorityOrder];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) as EscalationWithDetails[];
}

async function getResolvedCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabaseAdmin
    .from('escalations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'resolved')
    .gte('resolved_at', today.toISOString());

  return count || 0;
}

export default async function EscalationsPage() {
  const [escalations, resolvedToday] = await Promise.all([
    getEscalations(),
    getResolvedCount(),
  ]);

  const pendingCount = escalations.filter((e) => e.status === 'pending').length;
  const claimedCount = escalations.filter((e) => e.status === 'claimed').length;

  return (
    <div className="p-6">
      <PageHeader
        title="Escalaciones"
        description="Conversaciones que requieren atención humana"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">Pendientes</p>
          <p className="text-2xl font-bold text-red-700">{pendingCount}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">En atención</p>
          <p className="text-2xl font-bold text-blue-700">{claimedCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Resueltas hoy</p>
          <p className="text-2xl font-bold text-green-700">{resolvedToday}</p>
        </div>
      </div>

      {/* Queue */}
      <EscalationQueueClient escalations={escalations} />
    </div>
  );
}

// Client component for interactive actions
import { EscalationQueueClient } from './EscalationQueueClient';
