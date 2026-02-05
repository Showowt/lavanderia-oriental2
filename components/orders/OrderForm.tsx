'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency } from '@/lib/utils';
import type { Service, Location, Customer } from '@/types';

interface OrderFormData {
  customer_id: string;
  location_id?: string;
  items: Array<{ service_id: string; quantity: number }>;
  notes?: string;
}

interface OrderFormProps {
  customers: Customer[];
  services: Service[];
  locations: Location[];
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function OrderForm({
  customers,
  services,
  locations,
  onSubmit,
  onCancel,
  loading = false,
}: OrderFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [selectedItems, setSelectedItems] = useState<
    Array<{ service_id: string; quantity: number }>
  >([]);
  const [notes, setNotes] = useState('');

  const [total, setTotal] = useState(0);

  // Calculate total when items change
  useEffect(() => {
    const subtotal = selectedItems.reduce((sum, item) => {
      const service = services.find((s) => s.id === item.service_id);
      return sum + (service?.price || 0) * item.quantity;
    }, 0);
    const tax = subtotal * 0.16;
    setTotal(subtotal + tax);
  }, [selectedItems, services]);

  const addItem = () => {
    setSelectedItems([...selectedItems, { service_id: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: 'service_id' | 'quantity',
    value: string | number
  ) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || selectedItems.length === 0) return;

    const validItems = selectedItems.filter(
      (item) => item.service_id && item.quantity > 0
    );
    if (validItems.length === 0) return;

    onSubmit({
      customer_id: customerId,
      location_id: locationId || undefined,
      items: validItems,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Selection */}
      <Select
        label="Cliente"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        options={customers.map((c) => ({
          value: c.id,
          label: c.name || c.phone,
        }))}
        placeholder="Seleccionar cliente"
      />

      {/* Location Selection */}
      <Select
        label="Ubicación"
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
        options={locations.map((l) => ({
          value: l.id,
          label: l.name,
        }))}
        placeholder="Seleccionar ubicación (opcional)"
      />

      {/* Items */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Servicios
        </label>
        {selectedItems.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Select
              value={item.service_id}
              onChange={(e) => updateItem(index, 'service_id', e.target.value)}
              options={services.map((s) => ({
                value: s.id,
                label: `${s.name} - ${formatCurrency(s.price)}/${s.unit}`,
              }))}
              placeholder="Seleccionar servicio"
              className="flex-1"
            />
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, 'quantity', parseInt(e.target.value) || 1)
              }
              className="w-20"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeItem(index)}
              className="text-red-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addItem} size="sm">
          + Agregar servicio
        </Button>
      </div>

      {/* Notes */}
      <Input
        label="Notas (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Instrucciones especiales..."
      />

      {/* Total */}
      <div className="flex justify-between items-center py-4 border-t border-gray-200">
        <span className="text-lg font-medium text-gray-900">Total:</span>
        <span className="text-2xl font-bold text-blue-600">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!customerId || selectedItems.length === 0}
        >
          Crear Orden
        </Button>
      </div>
    </form>
  );
}
