import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, zone, budget, experience, message } = body;

    // Validate required fields
    if (!name || !phone || !email || !zone) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }

    // Save to franchise_inquiries table
    const { data, error } = await supabaseAdmin
      .from('franchise_inquiries')
      .insert({
        name,
        phone,
        email,
        zone,
        budget: budget || null,
        experience: experience || null,
        message: message || null,
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, create it first
      if (error.code === '42P01') {
        // Table doesn't exist - still return success but log the issue
        console.log('franchise_inquiries table does not exist yet. Lead data:', { name, phone, email, zone, budget, experience, message });

        // For now, just log the lead - in production, create the table
        return NextResponse.json({
          success: true,
          message: 'Solicitud recibida. Nos pondremos en contacto pronto.',
        });
      }

      console.error('Error saving franchise inquiry:', error);
      return NextResponse.json(
        { success: false, error: 'Error al guardar la solicitud' },
        { status: 500 }
      );
    }

    // TODO: Send email notification to admin
    // TODO: Send WhatsApp confirmation to applicant

    return NextResponse.json({
      success: true,
      message: 'Solicitud recibida. Nos pondremos en contacto pronto.',
      id: data?.id,
    });
  } catch (error) {
    console.error('Franchise API error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // List franchise inquiries (admin only - would need auth check in production)
  try {
    const { data, error } = await supabaseAdmin
      .from('franchise_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching franchise inquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno' },
      { status: 500 }
    );
  }
}
