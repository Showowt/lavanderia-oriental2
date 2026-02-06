'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import type { KnowledgeBase } from '@/types';

interface KnowledgeBaseFormProps {
  entry?: KnowledgeBase;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = [
  { value: 'Precios', label: 'Precios' },
  { value: 'Horarios', label: 'Horarios' },
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Ubicaciones', label: 'Ubicaciones' },
  { value: 'Políticas', label: 'Políticas' },
  { value: 'Pagos', label: 'Pagos' },
  { value: 'Contacto', label: 'Contacto' },
  { value: 'General', label: 'General' },
];

export function KnowledgeBaseForm({ entry, isOpen, onClose, onSave }: KnowledgeBaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'General',
    question: '',
    answer: '',
    keywords: '',
    language: 'es' as 'es' | 'en',
    active: true,
  });

  // Update form when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        category: entry.category || 'General',
        question: entry.question || '',
        answer: entry.answer || '',
        keywords: entry.keywords?.join(', ') || '',
        language: entry.language || 'es',
        active: entry.active ?? true,
      });
    } else {
      setFormData({
        category: 'General',
        question: '',
        answer: '',
        keywords: '',
        language: 'es',
        active: true,
      });
    }
  }, [entry, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = entry
        ? `/api/knowledge-base/${entry.id}`
        : '/api/knowledge-base';

      const payload = {
        category: formData.category,
        question: formData.question,
        answer: formData.answer,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        language: formData.language,
        active: formData.active,
      };

      const response = await fetch(url, {
        method: entry ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save');

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving knowledge base entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entry ? 'Editar Pregunta' : 'Nueva Pregunta'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORIES}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idioma
            </label>
            <Select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value as 'es' | 'en' })}
              options={[
                { value: 'es', label: 'Español' },
                { value: 'en', label: 'English' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pregunta
          </label>
          <Input
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="¿Cuánto cuesta lavar ropa?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Respuesta
          </label>
          <textarea
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            placeholder="El lavado por libra cuesta $3.25 (incluye lavado y secado)..."
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Palabras clave (separadas por coma)
          </label>
          <Input
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="precio, costo, lavar, libra"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ayudan al AI a encontrar esta respuesta cuando el cliente hace preguntas similares
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="kb_active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="kb_active" className="text-sm text-gray-700">
            Activo (visible para el AI)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {entry ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
