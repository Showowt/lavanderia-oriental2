'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import type { Location } from '@/types';

interface LocationFormProps {
  location?: Location;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function LocationForm({ location, isOpen, onClose, onSave }: LocationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '+503 7947 5950',
    hours_weekday: '7:00 AM - 7:00 PM',
    hours_saturday: '7:00 AM - 5:00 PM',
    hours_sunday: '8:00 AM - 2:00 PM',
    delivery_available: true,
    status: 'active' as 'active' | 'coming_soon' | 'inactive',
  });

  // Update form when location changes
  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        address: location.address || '',
        phone: location.phone || '+503 7947 5950',
        hours_weekday: location.hours_weekday || '7:00 AM - 7:00 PM',
        hours_saturday: location.hours_saturday || '7:00 AM - 5:00 PM',
        hours_sunday: location.hours_sunday || '8:00 AM - 2:00 PM',
        delivery_available: location.delivery_available ?? true,
        status: location.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '+503 7947 5950',
        hours_weekday: '7:00 AM - 7:00 PM',
        hours_saturday: '7:00 AM - 5:00 PM',
        hours_sunday: '8:00 AM - 2:00 PM',
        delivery_available: true,
        status: 'active',
      });
    }
  }, [location, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = location
        ? `/api/locations/${location.id}`
        : '/api/locations';

      const response = await fetch(url, {
        method: location ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save');

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={location ? 'Editar Ubicación' : 'Nueva Ubicación'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="San Miguel"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Col. Ciudad Real C. Elizabeth Lote #2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+503 7947 5950"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lun-Vie
            </label>
            <Input
              value={formData.hours_weekday}
              onChange={(e) => setFormData({ ...formData, hours_weekday: e.target.value })}
              placeholder="7:00 AM - 7:00 PM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sábado
            </label>
            <Input
              value={formData.hours_saturday}
              onChange={(e) => setFormData({ ...formData, hours_saturday: e.target.value })}
              placeholder="7:00 AM - 5:00 PM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domingo
            </label>
            <Input
              value={formData.hours_sunday}
              onChange={(e) => setFormData({ ...formData, hours_sunday: e.target.value })}
              placeholder="8:00 AM - 2:00 PM"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'coming_soon' | 'inactive' })}
            options={[
              { value: 'active', label: 'Activa' },
              { value: 'coming_soon', label: 'Próximamente' },
              { value: 'inactive', label: 'Inactiva' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="delivery_available"
            checked={formData.delivery_available}
            onChange={(e) => setFormData({ ...formData, delivery_available: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="delivery_available" className="text-sm text-gray-700">
            Delivery disponible
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {location ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
