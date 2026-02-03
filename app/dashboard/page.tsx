import { supabaseAdmin } from '@/lib/supabase';

async function getDashboardStats() {
  const [conversations, orders, customers] = await Promise.all([
    supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabaseAdmin
      .from('orders')
      .select('total', { count: 'exact' })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabaseAdmin
      .from('customers')
      .select('*', { count: 'exact', head: true }),
  ]);

  return {
    activeConversations: conversations.count || 0,
    todayOrders: orders.count || 0,
    todayRevenue: orders.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
    totalCustomers: customers.count || 0,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Lavandería Oriental - Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Conversaciones Activas"
            value={stats.activeConversations}
            icon="💬"
            color="bg-blue-500"
          />
          <StatsCard
            title="Órdenes Hoy"
            value={stats.todayOrders}
            icon="📦"
            color="bg-green-500"
          />
          <StatsCard
            title="Ingresos Hoy"
            value={`$${stats.todayRevenue.toLocaleString()}`}
            icon="💰"
            color="bg-yellow-500"
          />
          <StatsCard
            title="Clientes Totales"
            value={stats.totalCustomers}
            icon="👥"
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Conversaciones Recientes</h2>
            <p className="text-gray-600">
              Sistema de conversaciones en desarrollo...
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Órdenes Recientes</h2>
            <p className="text-gray-600">
              Sistema de órdenes en desarrollo...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color} text-white text-3xl p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
