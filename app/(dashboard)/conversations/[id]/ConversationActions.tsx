'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { MessageInput } from '@/components/conversations/MessageInput';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface ConversationActionsProps {
  conversationId: string;
  status: string;
}

export function ConversationActions({
  conversationId,
  status,
}: ConversationActionsProps) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalatePriority, setEscalatePriority] = useState('medium');
  const [escalating, setEscalating] = useState(false);

  const handleSendMessage = async (content: string) => {
    setSending(true);
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }

      router.refresh();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) return;

    setEscalating(true);
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/escalate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: escalateReason,
            priority: escalatePriority,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al escalar');
      }

      setShowEscalateModal(false);
      setEscalateReason('');
      router.refresh();
    } catch (error) {
      console.error('Error escalating:', error);
      alert('Error al escalar la conversación');
    } finally {
      setEscalating(false);
    }
  };

  const handleResolve = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });

      if (!response.ok) {
        throw new Error('Error al resolver');
      }

      router.refresh();
    } catch (error) {
      console.error('Error resolving:', error);
      alert('Error al resolver la conversación');
    }
  };

  const isEscalated = status === 'escalated';
  const isResolved = status === 'resolved' || status === 'closed';

  return (
    <>
      <div className="border-t border-gray-200 bg-white">
        {/* Action buttons */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <div className="flex gap-2">
            {!isResolved && !isEscalated && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowEscalateModal(true)}
              >
                Escalar
              </Button>
            )}
            {!isResolved && (
              <Button variant="secondary" size="sm" onClick={handleResolve}>
                Resolver
              </Button>
            )}
          </div>
          {isEscalated && (
            <span className="text-sm text-red-600 font-medium">
              Conversación escalada - Requiere atención
            </span>
          )}
          {isResolved && (
            <span className="text-sm text-gray-500">
              Conversación resuelta
            </span>
          )}
        </div>

        {/* Message input */}
        <MessageInput
          onSend={handleSendMessage}
          disabled={sending || isResolved}
          placeholder={
            isResolved
              ? 'Conversación cerrada'
              : 'Escribe un mensaje...'
          }
        />
      </div>

      {/* Escalate Modal */}
      <Modal
        isOpen={showEscalateModal}
        onClose={() => setShowEscalateModal(false)}
        title="Escalar Conversación"
        description="Indica la razón de la escalación para que otro agente pueda ayudar."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowEscalateModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleEscalate}
              loading={escalating}
              disabled={!escalateReason.trim()}
            >
              Escalar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Textarea
            label="Razón de la escalación"
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.target.value)}
            placeholder="Describe por qué esta conversación necesita atención..."
            rows={3}
          />
          <Select
            label="Prioridad"
            value={escalatePriority}
            onChange={(e) => setEscalatePriority(e.target.value)}
            options={[
              { value: 'low', label: 'Baja' },
              { value: 'medium', label: 'Media' },
              { value: 'high', label: 'Alta' },
              { value: 'urgent', label: 'Urgente' },
            ]}
          />
        </div>
      </Modal>
    </>
  );
}
