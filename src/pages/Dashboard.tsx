import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import KPICard from '@/components/dashboard/KPICard';
import ExpenseChart from '@/components/dashboard/ExpenseChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  PieChart, 
  Calendar,
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DashboardKPIs, ChartData, ExpenseWithRelations } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [timelineData, setTimelineData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<ExpenseWithRelations[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch KPIs
      await fetchKPIs();
      
      // Fetch timeline chart data
      await fetchTimelineData();
      
      // Fetch category chart data
      await fetchCategoryData();
      
      // Fetch recent expenses
      await fetchRecentExpenses();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIs = async () => {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0];
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31).toISOString().split('T')[0];

    // Base query
    let expensesQuery = supabase
      .from('expenses')
      .select(`
        amount_gross,
        status,
        expense_date,
        category:categories(name)
      `)
      .gte('expense_date', startOfYear)
      .lte('expense_date', endOfYear);

    // If employee, filter by own expenses
    if (user?.role !== 'ADMIN') {
      expensesQuery = expensesQuery.eq('employee_id', user?.id);
    }

    const { data: expenses, error } = await expensesQuery;

    if (error) throw error;

    // Calculate KPIs
    const totalExpenses = expenses?.reduce((acc, exp) => acc + Number(exp.amount_gross), 0) || 0;
    const pendingExpenses = expenses?.filter(exp => exp.status === 'PENDING') || [];
    const pendingAmount = pendingExpenses.reduce((acc, exp) => acc + Number(exp.amount_gross), 0);

    // Group by category
    const categoryTotals = expenses?.reduce((acc, exp) => {
      const categoryName = exp.category?.name || 'Sin categoría';
      acc[categoryName] = (acc[categoryName] || 0) + Number(exp.amount_gross);
      return acc;
    }, {} as Record<string, number>) || {};

    const topCategory = Object.entries(categoryTotals).length > 0 
      ? Object.entries(categoryTotals).reduce((a, b) => a[1] > b[1] ? a : b)
      : null;

    // Calculate daily average
    const daysInYear = Math.ceil((currentDate.getTime() - new Date(startOfYear).getTime()) / (1000 * 60 * 60 * 24));
    const dailyAverage = totalExpenses / Math.max(daysInYear, 1);

    setKpis({
      total_expenses: totalExpenses,
      pending_expenses: pendingExpenses.length,
      pending_amount: pendingAmount,
      top_category: topCategory ? {
        name: topCategory[0],
        amount: topCategory[1],
        percentage: (topCategory[1] / totalExpenses) * 100
      } : null,
      daily_average: dailyAverage
    });
  };

  const fetchTimelineData = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    let query = supabase
      .from('expenses')
      .select('amount_gross, expense_date, status')
      .gte('expense_date', startDate)
      .order('expense_date', { ascending: true });

    if (user?.role !== 'ADMIN') {
      query = query.eq('employee_id', user?.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by date
    const dailyTotals = data?.reduce((acc, exp) => {
      const date = exp.expense_date;
      acc[date] = (acc[date] || 0) + Number(exp.amount_gross);
      return acc;
    }, {} as Record<string, number>) || {};

    const chartData = Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setTimelineData(chartData);
  };

  const fetchCategoryData = async () => {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];

    let query = supabase
      .from('expenses')
      .select(`
        amount_gross,
        category:categories(name)
      `)
      .gte('expense_date', startOfMonth)
      .eq('status', 'APPROVED');

    if (user?.role !== 'ADMIN') {
      query = query.eq('employee_id', user?.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by category
    const categoryTotals = data?.reduce((acc, exp) => {
      const categoryName = exp.category?.name || 'Sin categoría';
      acc[categoryName] = (acc[categoryName] || 0) + Number(exp.amount_gross);
      return acc;
    }, {} as Record<string, number>) || {};

    const chartData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ date: '', amount, category }))
      .sort((a, b) => b.amount - a.amount);

    setCategoryData(chartData);
  };

  const fetchRecentExpenses = async () => {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        employee:profiles!expenses_employee_id_fkey(name),
        category:categories(name),
        project_code:project_codes(code, name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (user?.role !== 'ADMIN') {
      query = query.eq('employee_id', user?.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    setRecentExpenses((data || []) as any);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'outline',
      APPROVED: 'default',
      REJECTED: 'destructive'
    } as const;

    const labels = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado'
    };

    const colors = {
      PENDING: 'text-warning',
      APPROVED: 'text-success', 
      REJECTED: 'text-danger'
    };

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'secondary'}
        className={colors[status as keyof typeof colors] || ''}
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {user?.name}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Gastos Totales"
          value={formatCurrency(kpis?.total_expenses || 0)}
          description="Este año"
          icon={TrendingUp}
          variant="default"
        />
        <KPICard
          title="Pendientes de Aprobación"
          value={kpis?.pending_expenses || 0}
          description={formatCurrency(kpis?.pending_amount || 0)}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="Categoría Principal"
          value={kpis?.top_category?.name || 'N/A'}
          description={kpis?.top_category ? 
            `${formatCurrency(kpis.top_category.amount)} (${kpis.top_category.percentage.toFixed(1)}%)` 
            : 'Sin datos'
          }
          icon={PieChart}
          variant="success"
        />
        <KPICard
          title="Promedio Diario"
          value={formatCurrency(kpis?.daily_average || 0)}
          description="Últimos 30 días"
          icon={DollarSign}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseChart
          data={timelineData}
          type="line"
          title="Evolución de Gastos"
          description="Últimos 30 días"
        />
        <ExpenseChart
          data={categoryData}
          type="pie"
          title="Gastos por Categoría"
          description="Este mes - Aprobados"
        />
      </div>

      {/* Recent Expenses */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Gastos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay gastos registrados aún</p>
              <p className="text-sm">Comienza subiendo tu primer ticket</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{expense.vendor}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category?.name} • {format(new Date(expense.expense_date), "d MMM yyyy", { locale: es })}
                        </p>
                        {user?.role === 'ADMIN' && (
                          <p className="text-xs text-muted-foreground">
                            Por: {expense.employee?.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(expense.status)}
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(expense.amount_gross)}</p>
                      <p className="text-xs text-muted-foreground">{expense.currency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;