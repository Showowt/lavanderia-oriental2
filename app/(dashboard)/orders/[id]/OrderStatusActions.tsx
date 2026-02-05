'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
}

const statusFlow = [
  { status: 'pending', label: 'Pendiente', next: 'confirmed' },
  { status: 'confirmed', label: 'Confirmada', next: 'in_progress' },
  { status: 'in_progress', label: 'En Proceso', next: 'ready' },
  { status: 'ready', label: 'Lista', next: 'delivered' },
  { status: 'delivered', label: 'Entregada', next: null },
  { status: 'cancelled', label: 'Cancelada', next: null },
];

const nextStatusLabels: Record<string, string> = {
  confirmed: 'Confirmar Orden',
  in_progress: 'Iniciar Proceso',
  ready: 'Marcar como Lista',
  delivered: 'Marcar como Entregada',
};

export function OrderStatusActions({
  orderId,
  currentStatus,
}: OrderStatusActionsProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const currentStep = statusFlow.find((s) => s.status === currentStatus);
  const nextStatus = currentStep?.next;

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error al actualizar la orden');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de cancelar esta orden?')) return;
    await handleUpdateStatus('cancelled');
  };

  if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
    return null;
  }

  return (
    <Card>
      <CardHeader title="Acciones" />
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {nextStatus && (
              <Button
                onClick={() => handleUpdateStatus(nextStatus)}
                loading={updating}
              >
                {nextStatusLabels[nextStatus] || 'Siguiente'}
              </Button>
            )}
          </div>
          <Button
            variant="danger"
            onClick={handleCancel}
            disabled={updating}
          >
            Cancelar Orden
          </Button>
        </div>

        {/* Status Timeline */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            {statusFlow.slice(0, 5).map((step, index) => {
              const isCompleted =
                statusFlow.findIndex((s) => s.status === currentStatus) > index;
              const isCurrent = step.status === currentStatus;

              return (
                <div key={step.status} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-12 h-1 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {statusFlow.slice(0, 5).map((step) => (
              <span
                key={step.status}
                className="text-xs text-gray-500 text-center w-20"
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
