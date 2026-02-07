const WHATSAPP_NUMBER = '50379475950';
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

export const whatsappLinks = {
  general: `${WHATSAPP_BASE}?text=${encodeURIComponent('Hola! Quiero información sobre sus servicios 🧺')}`,
  booking: `${WHATSAPP_BASE}?text=${encodeURIComponent('Hola! Quiero agendar mi lavada 🧺')}`,
  delivery: `${WHATSAPP_BASE}?text=${encodeURIComponent('Hola! Quiero agendar un delivery 🚚')}`,
  edredones: `${WHATSAPP_BASE}?text=${encodeURIComponent('Hola! Necesito lavar edredones 🛏️')}`,
  quote: `${WHATSAPP_BASE}?text=${encodeURIComponent('Hola! Quisiera una cotización 💰')}`,
  businessQuote: `${WHATSAPP_BASE}?text=${encodeURIComponent('Hola! Tengo un negocio y necesito cotización para servicio recurrente 💼')}`,
  franchise: `${WHATSAPP_BASE}?text=${encodeURIComponent('Hola! Me interesa información sobre franquicias 🏪')}`,
};

export function getWhatsAppLink(message?: string): string {
  if (message) {
    return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
  }
  return whatsappLinks.general;
}

export function formatPhoneDisplay(phone: string): string {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '+$1 $2-$3');
}

export const WHATSAPP_DISPLAY = '+503 7947-5950';
