import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createLocationSchema } from '@/lib/validations';
import type { Location } from '@/types';

export async function GET() {
  try {
    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(locations as Location[]);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al obtener ubicaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createLocationSchema.parse(body);

    const { data: location, error } = await supabaseAdmin
      .from('locations')
      .insert({
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        hours: data.hours || {},
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: location,
      message: 'Ubicación creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al crear ubicación' },
      { status: 500 }
    );
  }
}
