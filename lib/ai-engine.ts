import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from './supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ConversationContext {
  customerId: string;
  customerName?: string;
  conversationHistory: Array<{ role: string; content: string }>;
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
        ...context.conversationHistory.slice(-10), // Last 10 messages
        { role: 'user', content: message },
      ],
    });

    const aiResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Lo siento, no pude procesar tu mensaje.';

    // Detect escalation needs
    const shouldEscalate = detectEscalation(message, aiResponse);

    // Classify intent
    const intent = classifyIntent(message);

    return {
      response: aiResponse,
      shouldEscalate,
      intent,
    };
  } catch (error) {
    console.error('AI generation error:', error);
    return {
      response: 'Disculpa, estoy teniendo problemas técnicos. Un agente te contactará pronto.',
      shouldEscalate: true,
    };
  }
}

function detectEscalation(userMessage: string, aiResponse: string): boolean {
  const escalationKeywords = [
    'hablar con humano',
    'hablar con persona',
    'agente',
    'reclamo',
    'queja',
    'problema',
    'no funciona',
    'mal servicio',
  ];

  const lowerMessage = userMessage.toLowerCase();
  return escalationKeywords.some((keyword) => lowerMessage.includes(keyword));
}

function classifyIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('tarifa')) {
    return 'pricing';
  }
  if (lowerMessage.includes('horario') || lowerMessage.includes('abierto') || lowerMessage.includes('cerrado')) {
    return 'hours';
  }
  if (lowerMessage.includes('ubicación') || lowerMessage.includes('dirección') || lowerMessage.includes('dónde')) {
    return 'location';
  }
  if (lowerMessage.includes('orden') || lowerMessage.includes('servicio') || lowerMessage.includes('lavar')) {
    return 'order';
  }
  if (lowerMessage.includes('queja') || lowerMessage.includes('reclamo') || lowerMessage.includes('problema')) {
    return 'complaint';
  }

  return 'general_inquiry';
}
