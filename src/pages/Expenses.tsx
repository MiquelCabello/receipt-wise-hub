import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import DataTable from '@/components/ui/data-table';
import ExpenseForm from '@/components/forms/ExpenseForm';
import StatsCard from '@/components/ui/stats-card';
import { Receipt, Calendar, DollarSign, User, Plus, Filter, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  user: string;
  notes?: string;
}

const Expenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const expenses: Expense[] = [
    {
      id: '1',
      description: 'Cena con cliente importante',
      amount: 89.50,
      category: 'meals',
      date: '2024-01-15',
      status: 'approved',
      user: 'Ana García',
      notes: 'Reunión para cerrar contrato Q1'
    },
    {
      id: '2',
      description: 'Viaje a Madrid - Hotel',
      amount: 145.00,
      category: 'travel',
      date: '2024-01-14',
      status: 'pending',
      user: 'Carlos López'
    },
    {
      id: '3',
      description: 'Material de oficina',
      amount: 67.30,
      category: 'office',
      date: '2024-01-13',
      status: 'approved',
      user: 'María Rodríguez'
    },
    {
      id: '4',
      description: 'Licencia software',
      amount: 299.00,
      category: 'technology',
      date: '2024-01-12',
      status: 'rejected',
      user: 'José Martín',
      notes: 'Requiere aprobación de IT'
    }
  ];

  const categoryLabels = {
    travel: 'Viajes',
    meals: 'Comidas',
    office: 'Oficina',
    transport: 'Transporte',
    technology: 'Tecnología',
    marketing: 'Marketing',
    other: 'Otros'
  };

  const columns = [
    {
      key: 'description' as keyof Expense,
      label: 'Descripción',
      sortable: true,
      render: (value: string, row: Expense) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-sm text-muted-foreground">{row.user}</p>
        </div>
      )
    },
    {
      key: 'amount' as keyof Expense,
      label: 'Importe',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold">
          €{value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </span>
      ),
      className: 'text-right'
    },
    {
      key: 'category' as keyof Expense,
      label: 'Categoría',
      render: (value: string) => (
        <Badge variant="outline">
          {categoryLabels[value as keyof typeof categoryLabels] || value}
        </Badge>
      )
    },
    {
      key: 'date' as keyof Expense,
      label: 'Fecha',
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString('es-ES');
      }
    },
    {
      key: 'status' as keyof Expense,
      label: 'Estado',
      render: (value: string) => {
        const variants = {
          pending: { label: 'Pendiente', class: 'bg-warning/10 text-warning' },
          approved: { label: 'Aprobado', class: 'bg-success/10 text-success' },
          rejected: { label: 'Rechazado', class: 'bg-danger/10 text-danger' }
        };
        const variant = variants[value as keyof typeof variants];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.class}`}>
            {variant.label}
          </span>
        );
      }
    }
  ];

  const handleExpenseSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Here you would typically make an API call to save the expense
      console.log('Saving expense:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsFormOpen(false);
      toast({
        title: 'Gasto guardado',
        description: 'El gasto se ha registrado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el gasto',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    console.log('Editing expense:', expense);
    // Open edit dialog with expense data
  };

  const handleDelete = (expense: Expense) => {
    console.log('Deleting expense:', expense);
    // Show confirmation dialog and delete
  };

  const handleApprove = (expense: Expense) => {
    console.log('Approving expense:', expense);
    toast({
      title: 'Gasto aprobado',
      description: `El gasto de €${expense.amount} ha sido aprobado`,
    });
  };

  const handleReject = (expense: Expense) => {
    console.log('Rejecting expense:', expense);
    toast({
      title: 'Gasto rechazado',
      description: `El gasto de €${expense.amount} ha sido rechazado`,
      variant: 'destructive',
    });
  };

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
  const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
  const rejectedExpenses = expenses.filter(e => e.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">
            Gestiona todos los gastos de la empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
              </DialogHeader>
              <ExpenseForm
                onSubmit={handleExpenseSubmit}
                onCancel={() => setIsFormOpen(false)}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Gastos"
          value={`€${totalExpenses.toLocaleString('es-ES')}`}
          subtitle="Este mes"
          icon={DollarSign}
          variant="financial"
        />
        <StatsCard
          title="Pendientes"
          value={pendingExpenses}
          subtitle="Esperando aprobación"
          icon={Calendar}
          variant="warning"
        />
        <StatsCard
          title="Aprobados"
          value={approvedExpenses}
          subtitle="Este mes"
          icon={Receipt}
          variant="success"
        />
        <StatsCard
          title="Rechazados"
          value={rejectedExpenses}
          subtitle="Este mes"
          icon={User}
          variant="danger"
        />
      </div>

      {/* Expenses Table */}
      <DataTable
        data={expenses}
        columns={columns}
        title="Lista de Gastos"
        searchPlaceholder="Buscar gastos..."
        onEdit={handleEdit}
        onDelete={handleDelete}
        onApprove={user?.role === 'ADMIN' ? handleApprove : undefined}
        onReject={user?.role === 'ADMIN' ? handleReject : undefined}
        emptyMessage="No hay gastos registrados"
      />
    </div>
  );
};

export default Expenses;