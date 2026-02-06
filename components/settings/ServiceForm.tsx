'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import type { Service, ServiceCategory } from '@/types';

interface ServiceFormProps {
  service?: Service;
  categories: ServiceCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const UNIT_OPTIONS = [
  { value: 'libra', label: 'Libra' },
  { value: 'unidad', label: 'Unidad' },
  { value: '10 minutos', label: '10 minutos' },
  { value: 'pieza', label: 'Pieza' },
  { value: 'servicio', label: 'Servicio' },
];

const CATEGORY_OPTIONS = [
  { value: 'Lavado', label: 'Lavado' },
  { value: 'Secado', label: 'Secado' },
  { value: 'Especiales', label: 'Especiales' },
  { value: 'Planchado', label: 'Planchado' },
  { value: 'Delivery', label: 'Delivery' },
];

export function ServiceForm({ service, categories, isOpen, onClose, onSave }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    category_id: '',
    name: '',
    description: '',
    price_lavado_secado: '',
    price_solo_lavado: '',
    price_solo_secado: '',
    price_unit: 'unidad',
    active: true,
  });

  // Update form when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        category: service.category || '',
        category_id: service.category_id || '',
        name: service.name || '',
        description: service.description || '',
        price_lavado_secado: service.price_lavado_secado?.toString() || '',
        price_solo_lavado: service.price_solo_lavado?.toString() || '',
        price_solo_secado: service.price_solo_secado?.toString() || '',
        price_unit: service.price_unit || 'unidad',
        active: service.active ?? true,
      });
    } else {
      setFormData({
        category: categories[0]?.name || 'Lavado',
        category_id: categories[0]?.id || '',
        name: '',
        description: '',
        price_lavado_secado: '',
        price_solo_lavado: '',
        price_solo_secado: '',
        price_unit: 'unidad',
        active: true,
      });
    }
  }, [service, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = service
        ? `/api/services/${service.id}`
        : '/api/services';

      const payload = {
        category: formData.category,
        category_id: formData.category_id || null,
        name: formData.name,
        description: formData.description || null,
        price_lavado_secado: formData.price_lavado_secado ? parseFloat(formData.price_lavado_secado) : null,
        price_solo_lavado: formData.price_solo_lavado ? parseFloat(formData.price_solo_lavado) : null,
        price_solo_secado: formData.price_solo_secado ? parseFloat(formData.price_solo_secado) : null,
        price_unit: formData.price_unit,
        active: formData.active,
      };

      const response = await fetch(url, {
        method: service ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save');

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build category options from categories prop or default
  const categoryOptions = categories.length > 0
    ? categories.map(c => ({ value: c.name, label: `${c.icon || ''} ${c.name}`.trim() }))
    : CATEGORY_OPTIONS;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Editar Servicio' : 'Nuevo Servicio'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <Select
            value={formData.category}
            onChange={(e) => {
              const cat = categories.find(c => c.name === e.target.value);
              setFormData({
                ...formData,
                category: e.target.value,
                category_id: cat?.id || ''
              });
            }}
            options={categoryOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Lavado por Libra"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Lavado profesional de ropa del día a día"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lavado + Secado ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.price_lavado_secado}
              onChange={(e) => setFormData({ ...formData, price_lavado_secado: e.target.value })}
              placeholder="3.25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solo Lavado ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.price_solo_lavado}
              onChange={(e) => setFormData({ ...formData, price_solo_lavado: e.target.value })}
              placeholder="2.50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solo Secado ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.price_solo_secado}
              onChange={(e) => setFormData({ ...formData, price_solo_secado: e.target.value })}
              placeholder="1.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad de Precio
          </label>
          <Select
            value={formData.price_unit}
            onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
            options={UNIT_OPTIONS}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="service_active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="service_active" className="text-sm text-gray-700">
            Servicio activo
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {service ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
