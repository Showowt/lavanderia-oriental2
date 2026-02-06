import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Location } from '@/types';

export async function GET() {
  try {
    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .eq('status', 'active')
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

    const { data: location, error } = await supabaseAdmin
      .from('locations')
      .insert({
        name: body.name,
        address: body.address,
        phone: body.phone || '+503 7947 5950',
        hours_weekday: body.hours_weekday || '7:00 AM - 7:00 PM',
        hours_saturday: body.hours_saturday || '7:00 AM - 5:00 PM',
        hours_sunday: body.hours_sunday || '8:00 AM - 2:00 PM',
        delivery_available: body.delivery_available ?? true,
        status: 'active',
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
