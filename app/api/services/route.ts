import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createServiceSchema } from '@/lib/validations';
import type { ServiceCatalog } from '@/types';

export async function GET() {
  try {
    // Get all categories with their services
    const { data: categories, error: catError } = await supabaseAdmin
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (catError) {
      throw catError;
    }

    // Get all active services
    const { data: services, error: svcError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (svcError) {
      throw svcError;
    }

    // Group services by category
    const catalog: ServiceCatalog = {
      categories: (categories || []).map((category) => ({
        ...category,
        services: (services || []).filter(
          (service) => service.category_id === category.id
        ),
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
    const data = createServiceSchema.parse(body);

    const { data: service, error } = await supabaseAdmin
      .from('services')
      .insert({
        category_id: data.category_id,
        name: data.name,
        description: data.description || null,
        price: data.price,
        unit: data.unit,
        estimated_hours: data.estimated_hours || null,
        is_active: true,
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
