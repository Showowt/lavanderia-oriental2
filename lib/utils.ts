import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to Spanish locale string
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', options);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time only (for messages)
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a relative time (e.g., "hace 5 minutos")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return formatDate(d);
}

/**
 * Format currency in Mexican Pesos
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  // Remove whatsapp: prefix if present
  const cleaned = phone.replace('whatsapp:', '').replace(/\D/g, '');

  // Format as Mexican phone number
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('52')) {
    return `+52 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get status color classes
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Conversation statuses
    active: 'bg-success-100 text-success-700',
    escalated: 'bg-error-100 text-error-700',
    resolved: 'bg-slate-100 text-slate-700',
    closed: 'bg-slate-100 text-slate-600',
    // Order statuses
    pending: 'bg-warning-100 text-warning-700',
    confirmed: 'bg-brand-100 text-brand-700',
    in_progress: 'bg-accent-100 text-accent-700',
    ready: 'bg-success-100 text-success-700',
    delivered: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-error-100 text-error-700',
    // Escalation statuses
    claimed: 'bg-brand-100 text-brand-700',
    // Priority
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-warning-100 text-warning-700',
    high: 'bg-accent-100 text-accent-700',
    urgent: 'bg-error-100 text-error-700',
  };
  return colors[status] || 'bg-slate-100 text-slate-700';
}

/**
 * Get status display text in Spanish
 */
export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    // Conversation statuses
    active: 'Activa',
    escalated: 'Escalada',
    resolved: 'Resuelta',
    closed: 'Cerrada',
    // Order statuses
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    in_progress: 'En Proceso',
    ready: 'Lista',
    delivered: 'Entregada',
    cancelled: 'Cancelada',
    // Escalation statuses
    claimed: 'En Atención',
    // Priority
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
  };
  return texts[status] || status;
}

/**
 * Calculate pagination values
 */
export function calculatePagination(
  page: number,
  pageSize: number,
  total: number
) {
  const totalPages = Math.ceil(total / pageSize);
  const from = (page - 1) * pageSize;
  const to = Math.min(from + pageSize - 1, total - 1);

  return {
    from,
    to,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Generate a unique order number
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
}
