import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from './supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ConversationContext {
  customerId: string;
  customerName?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  orderHistory?: Array<{ id: string; status: string; total: number; created_at: string }>;
  language: string;
}

// Detect language from message content
function detectLanguage(message: string): 'es' | 'en' {
  const englishIndicators = [
    'hello', 'hi', 'how', 'what', 'when', 'where', 'price', 'cost',
    'order', 'hours', 'open', 'close', 'thank', 'please', 'help',
    'laundry', 'wash', 'clean', 'pickup', 'delivery', 'service'
  ];

  const spanishIndicators = [
    'hola', 'buenas', 'cómo', 'qué', 'cuándo', 'dónde', 'precio',
    'orden', 'horario', 'abierto', 'cerrado', 'gracias', 'favor',
    'lavandería', 'lavar', 'limpio', 'recoger', 'entrega', 'servicio'
  ];

  const lower = message.toLowerCase();

  const englishScore = englishIndicators.filter(word => lower.includes(word)).length;
  const spanishScore = spanishIndicators.filter(word => lower.includes(word)).length;

  return englishScore > spanishScore ? 'en' : 'es';
}

// System prompts for each language
const systemPrompts = {
  es: (context: ConversationContext) => `Eres Sofia, la asistente virtual de Lavandería Oriental en El Salvador.

CONTEXTO DEL CLIENTE:
- Nombre: ${context.customerName || 'Cliente'}
- Historial: ${context.orderHistory?.length || 0} órdenes previas
${context.orderHistory && context.orderHistory.length > 0
  ? `- Última orden: ${context.orderHistory[0].status} ($${context.orderHistory[0].total?.toFixed(2) || '0.00'})`
  : ''}

TU MISIÓN:
1. Ayudar con consultas sobre servicios de lavandería
2. Informar sobre precios, horarios y ubicaciones
3. Ayudar con el estado de órdenes
4. Tomar nuevas solicitudes de servicio
5. Responder preguntas frecuentes

INFORMACIÓN DE LA EMPRESA:
- Servicios: Lavado y secado, solo lavado, solo secado, lavado en seco, planchado
- Horarios: Lun-Vie 7am-8pm, Sáb 8am-6pm, Dom cerrado
- Ubicaciones: Múltiples sucursales en El Salvador
- Delivery disponible en algunas ubicaciones

CUANDO ESCALAR A UN HUMANO:
- El cliente pide explícitamente hablar con una persona
- Hay una queja o reclamo
- Problemas con pagos o facturación
- Situaciones que no puedes resolver

IMPORTANTE:
- Responde SIEMPRE en español
- Sé amigable, profesional y conciso
- Usa emojis moderadamente para ser más cálida
- Si no sabes algo, ofrece conectar con un agente`,

  en: (context: ConversationContext) => `You are Sofia, the virtual assistant for Lavandería Oriental in El Salvador.

CUSTOMER CONTEXT:
- Name: ${context.customerName || 'Customer'}
- History: ${context.orderHistory?.length || 0} previous orders
${context.orderHistory && context.orderHistory.length > 0
  ? `- Last order: ${context.orderHistory[0].status} ($${context.orderHistory[0].total?.toFixed(2) || '0.00'})`
  : ''}

YOUR MISSION:
1. Help with laundry service inquiries
2. Provide pricing, hours, and location information
3. Assist with order status
4. Take new service requests
5. Answer frequently asked questions

COMPANY INFORMATION:
- Services: Wash & dry, wash only, dry only, dry cleaning, ironing
- Hours: Mon-Fri 7am-8pm, Sat 8am-6pm, Sun closed
- Locations: Multiple branches in El Salvador
- Delivery available at some locations

WHEN TO ESCALATE TO A HUMAN:
- Customer explicitly asks to speak with a person
- There's a complaint or claim
- Payment or billing issues
- Situations you cannot resolve

IMPORTANT:
- ALWAYS respond in English
- Be friendly, professional, and concise
- Use emojis sparingly to be warm
- If you don't know something, offer to connect with an agent`,
};

export async function generateAIResponse(
  message: string,
  context: ConversationContext
): Promise<{ response: string; shouldEscalate: boolean; intent?: string }> {
  try {
    // Detect language from the current message
    const detectedLanguage = detectLanguage(message);

    // Use detected language, but prefer customer's saved preference
    const language = context.language === 'en' ? 'en' :
                     (detectedLanguage === 'en' ? 'en' : 'es');

    // Update customer language preference if it seems to have changed
    if (detectedLanguage !== context.language) {
      try {
        await supabaseAdmin
          .from('customers')
          .update({ language: detectedLanguage })
          .eq('id', context.customerId);
      } catch (e) {
        console.log('Could not update customer language preference');
      }
    }

    // Get the appropriate system prompt
    const systemPrompt = systemPrompts[language as 'es' | 'en'](context);

    // Search knowledge base for relevant info in the detected language
    const { data: knowledge } = await supabaseAdmin
      .from('knowledge_base')
      .select('*')
      .eq('active', true)
      .eq('language', language)
      .limit(10);

    let knowledgeContext = '';
    if (knowledge && knowledge.length > 0) {
      const header = language === 'en' ? 'RELEVANT INFORMATION:' : 'INFORMACIÓN RELEVANTE:';
      knowledgeContext = `\n\n${header}\n${knowledge
        .map((k) => `Q: ${k.question}\nA: ${k.answer}`)
        .join('\n\n')}`;
    }

    // Get services and locations info
    const { data: services } = await supabaseAdmin
      .from('services')
      .select('name, price_lavado_secado, price_unit')
      .eq('active', true)
      .limit(10);

    const { data: locations } = await supabaseAdmin
      .from('locations')
      .select('name, address, hours_weekday, hours_saturday, delivery_available')
      .eq('status', 'active')
      .limit(5);

    let businessContext = '';
    if (services && services.length > 0) {
      const servicesHeader = language === 'en' ? 'CURRENT SERVICES:' : 'SERVICIOS ACTUALES:';
      businessContext += `\n\n${servicesHeader}\n${services
        .map(s => `- ${s.name}: $${(s.price_lavado_secado || 0).toFixed(2)}/${s.price_unit}`)
        .join('\n')}`;
    }

    if (locations && locations.length > 0) {
      const locationsHeader = language === 'en' ? 'LOCATIONS:' : 'UBICACIONES:';
      businessContext += `\n\n${locationsHeader}\n${locations
        .map(l => `- ${l.name}: ${l.address} (${l.hours_weekday})${l.delivery_available ? ' [Delivery]' : ''}`)
        .join('\n')}`;
    }

    // Generate response
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt + knowledgeContext + businessContext,
      messages: [
        ...context.conversationHistory.slice(-10).map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: message },
      ],
    });

    const aiResponse =
      response.content[0].type === 'text'
        ? response.content[0].text
        : language === 'en'
        ? "I'm sorry, I couldn't process your message. Could you try again?"
        : 'Lo siento, no pude procesar tu mensaje. ¿Podrías intentar de nuevo?';

    // Detect escalation needs (both languages)
    const shouldEscalate = detectEscalation(message, aiResponse, language);

    return {
      response: aiResponse,
      shouldEscalate,
      intent: detectIntent(message, language),
    };
  } catch (error) {
    console.error('AI Engine Error:', error);
    const errorMsg = context.language === 'en'
      ? "I'm sorry, there was a problem processing your message. Would you like to speak with a human agent?"
      : 'Lo siento, hubo un problema al procesar tu mensaje. ¿Te gustaría hablar con un agente?';

    return {
      response: errorMsg,
      shouldEscalate: true,
    };
  }
}

function detectEscalation(message: string, response: string, language: string): boolean {
  const lower = message.toLowerCase();
  const responseLower = response.toLowerCase();

  const spanishEscalationTriggers = [
    'queja', 'reclamo', 'hablar con', 'persona real', 'humano',
    'gerente', 'supervisor', 'problema con pago', 'factura', 'reembolso',
    'muy mal', 'pésimo', 'terrible', 'inaceptable', 'demanda'
  ];

  const englishEscalationTriggers = [
    'complaint', 'speak with', 'real person', 'human', 'manager',
    'supervisor', 'payment issue', 'invoice', 'refund', 'terrible',
    'unacceptable', 'lawsuit', 'very bad', 'awful'
  ];

  const triggers = language === 'en' ? englishEscalationTriggers : spanishEscalationTriggers;

  // Check if message contains escalation triggers
  const messageHasTrigger = triggers.some((t) => lower.includes(t));

  // Check if AI response indicates escalation
  const responseIndicatesEscalation =
    responseLower.includes('escalar') ||
    responseLower.includes('humano') ||
    responseLower.includes('agente') ||
    responseLower.includes('human agent') ||
    responseLower.includes('connect you with');

  return messageHasTrigger || responseIndicatesEscalation;
}

function detectIntent(message: string, language: string): string {
  const lower = message.toLowerCase();

  // Spanish intents
  const spanishIntents: Record<string, string[]> = {
    pricing_inquiry: ['precio', 'cuesta', 'cobran', 'costo', 'tarifa', 'cuánto'],
    hours_inquiry: ['horario', 'abierto', 'hora', 'cerrado', 'abre', 'cierra'],
    location_inquiry: ['ubicación', 'donde', 'dirección', 'sucursal', 'cerca'],
    order_status: ['estado', 'orden', 'pedido', 'lista', 'listo', 'cuándo'],
    service_request: ['servicio', 'lavar', 'lavado', 'secado', 'planchar', 'ropa'],
    delivery_inquiry: ['delivery', 'domicilio', 'entregar', 'recoger', 'llevar'],
    complaint: ['queja', 'reclamo', 'problema', 'mal', 'error', 'daño'],
  };

  // English intents
  const englishIntents: Record<string, string[]> = {
    pricing_inquiry: ['price', 'cost', 'charge', 'rate', 'how much', 'fee'],
    hours_inquiry: ['hours', 'open', 'close', 'time', 'schedule'],
    location_inquiry: ['location', 'where', 'address', 'branch', 'near'],
    order_status: ['status', 'order', 'ready', 'when', 'pickup'],
    service_request: ['service', 'wash', 'dry', 'iron', 'clean', 'laundry'],
    delivery_inquiry: ['delivery', 'pickup', 'drop off', 'bring', 'collect'],
    complaint: ['complaint', 'problem', 'issue', 'wrong', 'damage', 'ruined'],
  };

  const intents = language === 'en' ? englishIntents : spanishIntents;

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return intent;
    }
  }

  return 'general_inquiry';
}

// Greeting response for new conversations
export function getGreetingMessage(language: string, customerName?: string): string {
  if (language === 'en') {
    return `Hello${customerName ? ` ${customerName}` : ''}! 👋 Welcome to Lavandería Oriental. I'm Sofia, your virtual assistant. How can I help you today?

I can assist you with:
• Service prices and information
• Hours and locations
• Order status
• New service requests

How may I help you?`;
  }

  return `¡Hola${customerName ? ` ${customerName}` : ''}! 👋 Bienvenido/a a Lavandería Oriental. Soy Sofia, tu asistente virtual. ¿En qué puedo ayudarte hoy?

Puedo asistirte con:
• Precios e información de servicios
• Horarios y ubicaciones
• Estado de órdenes
• Nuevas solicitudes de servicio

¿Cómo puedo ayudarte?`;
}
