import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { KnowledgeBase } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const language = searchParams.get('language') || 'es';

    let query = supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('active', true)
      .order('category', { ascending: true })
      .order('question', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (language) {
      query = query.eq('language', language);
    }

    const { data: entries, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(entries as KnowledgeBase[]);
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al obtener base de conocimientos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: entry, error } = await supabaseAdmin
      .from('knowledge_base')
      .insert({
        category: body.category,
        question: body.question,
        answer: body.answer,
        keywords: body.keywords || [],
        language: body.language || 'es',
        active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: entry,
      message: 'Entrada creada exitosamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating knowledge base entry:', error);
    return NextResponse.json(
      { error: 'Error interno', message: 'Error al crear entrada' },
      { status: 500 }
    );
  }
}
