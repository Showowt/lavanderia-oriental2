'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LocationForm, ServiceForm, KnowledgeBaseForm } from '@/components/settings';
import { formatCurrency } from '@/lib/utils';
import type { Location, ServiceCategory, Service, KnowledgeBase, ServiceCatalog, ServiceCategoryWithServices } from '@/types';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryWithServices[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeBase[]>([]);

  // Modal states
  const [locationModal, setLocationModal] = useState<{ open: boolean; item?: Location }>({ open: false });
  const [serviceModal, setServiceModal] = useState<{ open: boolean; item?: Service }>({ open: false });
  const [kbModal, setKbModal] = useState<{ open: boolean; item?: KnowledgeBase }>({ open: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [locRes, srvRes, kbRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/services'),
        fetch('/api/knowledge-base'),
      ]);

      if (locRes.ok) setLocations(await locRes.json());
      if (srvRes.ok) {
        const catalog: ServiceCatalog = await srvRes.json();
        setCategories(catalog.categories || []);
        const allServices = catalog.categories?.flatMap(c => c.services) || [];
        setServices(allServices);
      }
      if (kbRes.ok) setKnowledge(await kbRes.json());
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type: 'location' | 'service' | 'knowledge', id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;

    const urls: Record<string, string> = {
      location: `/api/locations/${id}`,
      service: `/api/services/${id}`,
      knowledge: `/api/knowledge-base/${id}`,
    };

    try {
      const response = await fetch(urls[type], { method: 'DELETE' });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // Get display price for service
  const getServicePrice = (service: Service): string => {
    if (service.price_lavado_secado) {
      return formatCurrency(service.price_lavado_secado);
    }
    if (service.price_solo_lavado) {
      return formatCurrency(service.price_solo_lavado);
    }
    if (service.price_solo_secado) {
      return formatCurrency(service.price_solo_secado);
    }
    return '$0.00';
  };

  // Group knowledge by category
  const knowledgeByCategory = knowledge.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, KnowledgeBase[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Configuración"
        description="Administra ubicaciones, servicios y base de conocimiento"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locations */}
        <Card>
          <CardHeader
            title="Ubicaciones"
            description="Sucursales de la lavandería"
            actions={
              <Button size="sm" onClick={() => setLocationModal({ open: true })}>
                + Agregar
              </Button>
            }
          />
          <CardContent noPadding>
            {locations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Sin ubicaciones configuradas
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {locations.map((location) => (
                  <div key={location.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {location.name}
                        </p>
                        <p className="text-xs text-gray-500">{location.address}</p>
                        {location.phone && (
                          <p className="text-xs text-gray-500">{location.phone}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          L-V: {location.hours_weekday} | S: {location.hours_saturday} | D: {location.hours_sunday}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={location.status === 'active' ? 'success' : location.status === 'coming_soon' ? 'warning' : 'default'}>
                          {location.status === 'active' ? 'Activa' : location.status === 'coming_soon' ? 'Próximamente' : 'Inactiva'}
                        </Badge>
                        {location.delivery_available && (
                          <Badge variant="info">Delivery</Badge>
                        )}
                        <button
                          onClick={() => setLocationModal({ open: true, item: location })}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete('location', location.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader
            title="Servicios"
            description="Catálogo de servicios"
            actions={
              <Button size="sm" onClick={() => setServiceModal({ open: true })}>
                + Agregar
              </Button>
            }
          />
          <CardContent noPadding>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Sin servicios configurados
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <div key={category.id} className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      {category.name}
                    </p>
                    <div className="space-y-2">
                      {category.services?.map((service: Service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <div className="flex-1">
                            <span className="text-gray-700">{service.name}</span>
                            <span className="text-gray-400 ml-2">
                              {getServicePrice(service)}/{service.price_unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={service.active ? 'success' : 'default'}>
                              {service.active ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <button
                              onClick={() => setServiceModal({ open: true, item: service })}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete('service', service.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!category.services || category.services.length === 0) && (
                        <p className="text-xs text-gray-400">Sin servicios</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Base de Conocimiento"
            description="Preguntas frecuentes para el AI"
            actions={
              <Button size="sm" onClick={() => setKbModal({ open: true })}>
                + Agregar
              </Button>
            }
          />
          <CardContent noPadding>
            {Object.keys(knowledgeByCategory).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Sin preguntas configuradas
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {Object.entries(knowledgeByCategory).map(([category, items]) => (
                  <div key={category} className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 mb-3 capitalize">
                      {category}
                    </p>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.question}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                {item.answer}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={item.active ? 'success' : 'default'}>
                                  {item.active ? 'Activo' : 'Inactivo'}
                                </Badge>
                                <Badge variant="info">
                                  {item.language === 'es' ? 'Español' : 'English'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => setKbModal({ open: true, item })}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete('knowledge', item.id)}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <LocationForm
        location={locationModal.item}
        isOpen={locationModal.open}
        onClose={() => setLocationModal({ open: false })}
        onSave={fetchData}
      />

      <ServiceForm
        service={serviceModal.item}
        categories={categories}
        isOpen={serviceModal.open}
        onClose={() => setServiceModal({ open: false })}
        onSave={fetchData}
      />

      <KnowledgeBaseForm
        entry={kbModal.item}
        isOpen={kbModal.open}
        onClose={() => setKbModal({ open: false })}
        onSave={fetchData}
      />
    </div>
  );
}
