import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Calendar, DollarSign, User } from 'lucide-react';

const Expenses = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">
            Gestiona todos los gastos de la empresa
          </p>
        </div>
        <Button>
          <Receipt className="w-4 h-4 mr-2" />
          Nuevo Gasto
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Lista de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay gastos registrados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Expenses;