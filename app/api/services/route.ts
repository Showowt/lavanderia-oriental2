import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Service, ServiceCategory, ServiceCatalog } from '@/types';

export async function GET() {
  try {
    // Get all categories
    const { data: categories, error: catError } = await supabaseAdmin
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (catError) {
      console.error('Error fetching categories:', catError);
    }

    // Get all active services
    const { data: services, error: svcError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });

    if (svcError) {
      throw svcError;
    }

    // If we have categories, group services by category_id or category name
    if (categories && categories.length > 0) {
      const catalog: ServiceCatalog = {
        categories: categories.map((category: ServiceCategory) => ({
          ...category,
          services: (services || []).filter(
            (service: Service) =>
              service.category_id === category.id ||
              service.category === category.name
          ),
        })),
      };
      return NextResponse.json(catalog);
    }

    // Otherwise, group by category string field
    const categoryNames = [...new Set((services || []).map((s: Service) => s.category))];
    const catalog: ServiceCatalog = {
      categories: categoryNames.map((name, index) => ({
        id: `cat-${index}`,
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: null,
        icon: null,
        display_order: index,
        is_active: true,
        created_at: new Date().toISOString(),
        services: (services || []).filter((s: Service) => s.category === name),
      })),
    };

    return NextResponse.json(catalog);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al obtener servicios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .insert({
        category: body.category,
        category_id: body.category_id || null,
        name: body.name,
        description: body.description || null,
        price_lavado_secado: body.price_lavado_secado || body.price || null,
        price_solo_lavado: body.price_solo_lavado || null,
        price_solo_secado: body.price_solo_secado || null,
        price_unit: body.price_unit || body.unit || 'unidad',
        active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: service,
      message: 'Servicio creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al crear servicio' },
      { status: 500 }
    );
  }
}
