import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Employees = () => {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground">Solo los administradores pueden ver esta página</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Empleados</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios y empleados del sistema
          </p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay empleados registrados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Employees;