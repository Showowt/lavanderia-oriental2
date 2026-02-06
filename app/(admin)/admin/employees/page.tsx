'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { createClient } from '@/lib/supabase-browser';
import type { Employee, Location } from '@/types';

export default function AdminEmployeesPage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<(Employee & { location?: Location })[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, locRes] = await Promise.all([
        supabase.from('employees').select('*, location:locations(*)').order('created_at', { ascending: false }),
        supabase.from('locations').select('*'),
      ]);

      if (empRes.data) setEmployees(empRes.data);
      if (locRes.data) setLocations(locRes.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from('employees').update({ is_active: !currentStatus }).eq('id', id);
    fetchData();
  };

  const updateRole = async (id: string, role: 'admin' | 'employee') => {
    await supabase.from('employees').update({ role }).eq('id', id);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Empleados"
        description="Gestiona usuarios del sistema"
      />

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Para agregar empleados:</strong> Primero crea el usuario en Supabase Authentication,
          luego copia su UUID y agrégalo a la tabla employees con el SQL en la migración.
        </p>
      </div>

      <Card>
        <CardHeader title="Empleados Registrados" />
        <CardContent noPadding>
          {employees.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Sin empleados registrados</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{emp.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={emp.role === 'admin' ? 'danger' : 'info'}>
                        {emp.role === 'admin' ? 'Admin' : 'Empleado'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {emp.location?.name || 'Sin asignar'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={emp.is_active ? 'success' : 'default'}>
                        {emp.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateRole(emp.id, emp.role === 'admin' ? 'employee' : 'admin')}
                      >
                        {emp.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                      </Button>
                      <Button
                        size="sm"
                        variant={emp.is_active ? 'ghost' : 'secondary'}
                        onClick={() => toggleActive(emp.id, emp.is_active)}
                      >
                        {emp.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
