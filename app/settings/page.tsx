export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabase';
import { PageHeader } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import type { Location, ServiceCategory, Service, KnowledgeBase } from '@/types';

async function getSettings() {
  const [locationsResult, categoriesResult, servicesResult, knowledgeResult] =
    await Promise.all([
      supabaseAdmin.from('locations').select('*').order('name'),
      supabaseAdmin.from('service_categories').select('*').order('display_order'),
      supabaseAdmin.from('services').select('*').order('name'),
      supabaseAdmin
        .from('knowledge_base')
        .select('*')
        .order('category')
        .order('question'),
    ]);

  return {
    locations: (locationsResult.data || []) as Location[],
    categories: (categoriesResult.data || []) as ServiceCategory[],
    services: (servicesResult.data || []) as Service[],
    knowledge: (knowledgeResult.data || []) as KnowledgeBase[],
  };
}

export default async function SettingsPage() {
  const { locations, categories, services, knowledge } = await getSettings();

  // Group services by category
  const servicesByCategory = categories.map((cat) => ({
    ...cat,
    services: services.filter((s) => s.category_id === cat.id),
  }));

  // Group knowledge by category
  const knowledgeByCategory = knowledge.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, KnowledgeBase[]>);

  return (
    <div className="p-6">
      <PageHeader
        title="Configuración"
        description="Administra ubicaciones, servicios y base de conocimiento"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locations */}
        <Card>
          <CardHeader title="Ubicaciones" description="Sucursales de la lavandería" />
          <CardContent noPadding>
            {locations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Sin ubicaciones configuradas
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {locations.map((location) => (
                  <div key={location.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {location.name}
                        </p>
                        <p className="text-xs text-gray-500">{location.address}</p>
                        {location.phone && (
                          <p className="text-xs text-gray-500">{location.phone}</p>
                        )}
                      </div>
                      <Badge variant={location.is_active ? 'success' : 'default'}>
                        {location.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader title="Servicios" description="Catálogo de servicios" />
          <CardContent noPadding>
            {servicesByCategory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                Sin servicios configurados
              </p>
            ) : (
              <div className="divide-y divide-gray-200">
                {servicesByCategory.map((category) => (
                  <div key={category.id} className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {category.name}
                    </p>
                    <div className="space-y-2">
                      {category.services.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">{service.name}</span>
                          <span className="font-medium">
                            {formatCurrency(service.price)}/{service.unit}
                          </span>
                        </div>
                      ))}
                      {category.services.length === 0 && (
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
                          <p className="text-sm font-medium text-gray-900">
                            {item.question}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                            {item.answer}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={item.is_active ? 'success' : 'default'}
                            >
                              {item.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <Badge variant="info">
                              {item.language === 'es' ? 'Español' : 'English'}
                            </Badge>
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
    </div>
  );
}
