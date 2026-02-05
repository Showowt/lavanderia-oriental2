'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EscalationQueue } from '@/components/escalations/EscalationQueue';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import type { EscalationWithDetails } from '@/types';

interface EscalationQueueClientProps {
  escalations: EscalationWithDetails[];
}

export function EscalationQueueClient({
  escalations,
}: EscalationQueueClientProps) {
  const router = useRouter();
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClaim = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/escalations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim',
          claimed_by: 'Agente', // In a real app, this would come from auth
        }),
      });

      if (!response.ok) {
        throw new Error('Error al reclamar');
      }

      router.refresh();
    } catch (error) {
      console.error('Error claiming escalation:', error);
      alert('Error al reclamar la escalación');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveClick = (id: string) => {
    setSelectedId(id);
    setResolutionNotes('');
    setShowResolveModal(true);
  };

  const handleResolve = async () => {
    if (!selectedId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/escalations/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          resolution_notes: resolutionNotes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al resolver');
      }

      setShowResolveModal(false);
      setSelectedId(null);
      router.refresh();
    } catch (error) {
      console.error('Error resolving escalation:', error);
      alert('Error al resolver la escalación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <EscalationQueue
        escalations={escalations}
        onClaim={handleClaim}
        onResolve={handleResolveClick}
      />

      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolver Escalación"
        description="Marca esta escalación como resuelta"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowResolveModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleResolve} loading={loading}>
              Resolver
            </Button>
          </>
        }
      >
        <Textarea
          label="Notas de resolución (opcional)"
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          placeholder="Describe cómo se resolvió el problema..."
          rows={3}
        />
      </Modal>
    </>
  );
}
