import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from './supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ConversationContext {
  customerId: string;
  customerName?: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  orderHistory?: any[];
  language: string;
}

export async function generateAIResponse(
  message: string,
  context: ConversationContext
): Promise<{ response: string; shouldEscalate: boolean; intent?: string }> {
  try {
    // Build system prompt with context
    const systemPrompt = `Eres Sofia, la asistente virtual de Lavandería Oriental. 

CONTEXTO DEL CLIENTE:
- Nombre: ${context.customerName || 'Cliente'}
- Idioma: ${context.language}
- Historial de órdenes: ${context.orderHistory?.length || 0} órdenes

TU MISIÓN:
1. Ayudar a clientes con consultas sobre servicios de lavandería
2. Tomar órdenes de servicio
3. Responder preguntas sobre precios, horarios y ubicaciones
4. Detectar cuando necesitas escalar a un humano

CUANDO ESCALAR:
- Cliente solicita hablar con un humano
- Reclamo o queja
- Problema de pago
- Consulta fuera de tu conocimiento

Responde de forma amigable, profesional y concisa.`;

    // Search knowledge base for relevant info
    const { data: knowledge } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('is_active', true)
      .eq('language', context.language)
      .limit(5);

    let knowledgeContext = '';
    if (knowledge && knowledge.length > 0) {
      knowledgeContext = `\n\nINFORMACIÓN RELEVANTE:\n${knowledge
        .map((k) => `P: ${k.question}\nR: ${k.answer}`)
        .join('\n\n')}`;
    }

    // Generate response
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt + knowledgeContext,
      messages: [
        ...context.conversationHistory.slice(-10).map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        })),
        { role: 'user' as const, content: message },
      ],
    });

    const aiResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Lo siento, no pude procesar tu mensaje.';

    // Detect escalation needs
    const shouldEscalate = 
      aiResponse.toLowerCase().includes('escalar') ||
      aiResponse.toLowerCase().includes('humano') ||
      message.toLowerCase().includes('queja') ||
      message.toLowerCase().includes('reclamo');

    return {
      response: aiResponse,
      shouldEscalate,
      intent: detectIntent(message),
    };
  } catch (error) {
    console.error('AI Engine Error:', error);
    return {
      response: 'Lo siento, hubo un problema al procesar tu mensaje. ¿Podrías intentar de nuevo?',
      shouldEscalate: true,
    };
  }
}

function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('precio') || lower.includes('cuesta') || lower.includes('cobran')) {
    return 'pricing_inquiry';
  }
  if (lower.includes('horario') || lower.includes('abierto') || lower.includes('hora')) {
    return 'hours_inquiry';
  }
  if (lower.includes('ubicación') || lower.includes('donde') || lower.includes('dirección')) {
    return 'location_inquiry';
  }
  if (lower.includes('orden') || lower.includes('servicio') || lower.includes('lavar')) {
    return 'service_request';
  }
  
  return 'general_inquiry';
}
