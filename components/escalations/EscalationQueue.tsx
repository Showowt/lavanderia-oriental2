'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { EmptyState, InboxIcon } from '@/components/ui/EmptyState';
import { formatRelativeTime, formatPhone, truncate } from '@/lib/utils';
import type { EscalationWithDetails } from '@/types';

interface EscalationQueueProps {
  escalations: EscalationWithDetails[];
  onClaim?: (id: string) => void;
  onResolve?: (id: string) => void;
}

export function EscalationQueue({
  escalations,
  onClaim,
  onResolve,
}: EscalationQueueProps) {
  if (escalations.length === 0) {
    return (
      <EmptyState
        icon={<InboxIcon />}
        title="Sin escalaciones pendientes"
        description="No hay conversaciones que requieran atención humana"
      />
    );
  }

  return (
    <div className="space-y-4">
      {escalations.map((escalation) => (
        <EscalationCard
          key={escalation.id}
          escalation={escalation}
          onClaim={onClaim}
          onResolve={onResolve}
        />
      ))}
    </div>
  );
}

interface EscalationCardProps {
  escalation: EscalationWithDetails;
  onClaim?: (id: string) => void;
  onResolve?: (id: string) => void;
}

function EscalationCard({
  escalation,
  onClaim,
  onResolve,
}: EscalationCardProps) {
  const customer = escalation.conversation?.customer;
  const isPending = escalation.status === 'pending';
  const isClaimed = escalation.status === 'claimed';

  return (
    <Card className="overflow-hidden">
      {/* Priority indicator */}
      <div
        className={`h-1 ${
          escalation.priority === 'urgent'
            ? 'bg-error-500'
            : escalation.priority === 'high'
            ? 'bg-accent-500'
            : escalation.priority === 'medium'
            ? 'bg-warning-500'
            : 'bg-slate-300'
        }`}
      />

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/conversations/${escalation.conversation_id}`}
                className="text-sm font-semibold text-slate-900 hover:text-brand-600 transition-colors"
              >
                {customer?.name || 'Cliente'}
              </Link>
              <Badge status={escalation.priority} />
              <Badge status={escalation.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {customer?.phone ? formatPhone(customer.phone) : 'Sin teléfono'}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              <span className="font-medium">Razón:</span> {escalation.reason}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {formatRelativeTime(escalation.created_at)}
              {isClaimed && escalation.claimed_by && (
                <span> - Atendido por: {escalation.claimed_by}</span>
              )}
            </p>
          </div>

          <div className="flex-shrink-0 ml-4 flex gap-2">
            {isPending && onClaim && (
              <Button size="sm" onClick={() => onClaim(escalation.id)}>
                Reclamar
              </Button>
            )}
            {isClaimed && onResolve && (
              <Button size="sm" onClick={() => onResolve(escalation.id)}>
                Resolver
              </Button>
            )}
            <Link href={`/conversations/${escalation.conversation_id}`}>
              <Button size="sm" variant="secondary">
                Ver chat
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard alerts
interface EscalationAlertsProps {
  escalations: EscalationWithDetails[];
}

export function EscalationAlerts({ escalations }: EscalationAlertsProps) {
  const pendingCount = escalations.filter(
    (e) => e.status === 'pending'
  ).length;

  if (pendingCount === 0) {
    return null;
  }

  return (
    <div className="bg-error-50 border border-error-200 rounded-2xl p-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-error-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-error-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-error-800">
            {pendingCount} escalación{pendingCount !== 1 ? 'es' : ''} pendiente
            {pendingCount !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-error-600 mt-0.5">
            Requieren atención inmediata
          </p>
        </div>
        <Link href="/escalations">
          <Button size="sm" variant="danger">
            Ver todas
          </Button>
        </Link>
      </div>
    </div>
  );
}
