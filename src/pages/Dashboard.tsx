import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from '@/components/dashboard/KPICard';
import ExpenseChart from '@/components/dashboard/ExpenseChart';
import StatsCard from '@/components/ui/stats-card';
import ProgressBar from '@/components/ui/progress-bar';
import { TrendingUp, DollarSign, Receipt, Clock, Users, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { ChartData } from '@/types/database';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data for demonstration
  const monthlyExpenses: ChartData[] = [
    { date: '2024-01-01', amount: 1200, category: 'Oficina' },
    { date: '2024-01-02', amount: 800, category: 'Viajes' },
    { date: '2024-01-03', amount: 1500, category: 'Comidas' },
    { date: '2024-01-04', amount: 900, category: 'Transporte' },
    { date: '2024-01-05', amount: 2000, category: 'Tecnología' },
  ];

  const categoryExpenses: ChartData[] = [
    { category: 'Oficina', amount: 3200, date: '2024-01' },
    { category: 'Viajes', amount: 2800, date: '2024-01' },
    { category: 'Comidas', amount: 1500, date: '2024-01' },
    { category: 'Transporte', amount: 900, date: '2024-01' },
    { category: 'Tecnología', amount: 2000, date: '2024-01' },
  ];

  const budgetData = [
    { category: 'Oficina', spent: 3200, budget: 4000 },
    { category: 'Viajes', spent: 2800, budget: 3000 },
    { category: 'Comidas', spent: 1500, budget: 2000 },
    { category: 'Tecnología', spent: 2000, budget: 2500 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-muted-foreground">
          Resumen de gastos y actividad de tu organización
        </p>
      </div>

      {/* Enhanced KPI Cards with StatsCard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Gastos Este Mes"
          value="€10,400"
          subtitle="Total de gastos aprobados"
          icon={DollarSign}
          trend={{ value: 12, label: 'vs mes anterior', isPositive: false }}
          variant="financial"
        />
        <StatsCard
          title="Gastos Pendientes"
          value={23}
          subtitle="Esperando aprobación"
          icon={Clock}
          trend={{ value: 8, label: 'desde ayer', isPositive: true }}
          variant="warning"
        />
        <StatsCard
          title="Gastos Aprobados"
          value={145}
          subtitle="Este mes"
          icon={CheckCircle}
          trend={{ value: 15, label: 'vs mes anterior', isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Recibos Procesados"
          value={168}
          subtitle="Por IA este mes"
          icon={Receipt}
          trend={{ value: 22, label: 'vs mes anterior', isPositive: true }}
        />
      </div>

      {/* Budget Progress Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Progreso del Presupuesto
          </CardTitle>
          <CardDescription>
            Estado actual del presupuesto por categoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {budgetData.map((item) => {
              const percentage = (item.spent / item.budget) * 100;
              const variant = percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : 'success';
              
              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      €{item.spent.toLocaleString()} / €{item.budget.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar
                    value={item.spent}
                    max={item.budget}
                    variant={variant}
                    showPercentage
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseChart
          data={monthlyExpenses}
          type="line"
          title="Tendencia de Gastos"
          description="Evolución diaria de los gastos"
        />
        <ExpenseChart
          data={categoryExpenses}
          type="pie"
          title="Gastos por Categoría"
          description="Distribución de gastos por tipo"
        />
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimas transacciones y aprobaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                user: 'Ana García',
                action: 'subió un recibo',
                amount: '€45.30',
                time: 'hace 2 horas',
                status: 'pending'
              },
              {
                user: 'Carlos López',
                action: 'aprobó un gasto',
                amount: '€120.00',
                time: 'hace 4 horas',
                status: 'approved'
              },
              {
                user: 'María Rodríguez',
                action: 'rechazó un gasto',
                amount: '€89.50',
                time: 'hace 6 horas',
                status: 'rejected'
              },
              {
                user: 'José Martín',
                action: 'procesó automáticamente',
                amount: '€67.20',
                time: 'hace 1 día',
                status: 'approved'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/50 rounded-lg px-2 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-card">
                    <span className="text-sm font-medium text-white">
                      {activity.user.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      <span className="text-foreground">{activity.user}</span>
                      <span className="text-muted-foreground"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{activity.amount}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.status === 'approved' ? 'bg-success/10 text-success' :
                    activity.status === 'rejected' ? 'bg-danger/10 text-danger' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {activity.status === 'approved' ? 'Aprobado' :
                     activity.status === 'rejected' ? 'Rechazado' :
                     'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      {user?.role === 'ADMIN' && (
        <Card className="shadow-financial border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Acciones Requeridas
            </CardTitle>
            <CardDescription>
              Elementos que requieren tu atención inmediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-warning">Gastos Pendientes</h4>
                  <span className="text-2xl font-bold text-warning">23</span>
                </div>
                <p className="text-xs text-muted-foreground">Requieren aprobación</p>
              </div>
              <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-danger">Presupuesto Excedido</h4>
                  <span className="text-2xl font-bold text-danger">2</span>
                </div>
                <p className="text-xs text-muted-foreground">Categorías sobre límite</p>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-primary">Reportes Pendientes</h4>
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <p className="text-xs text-muted-foreground">Informe mensual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;