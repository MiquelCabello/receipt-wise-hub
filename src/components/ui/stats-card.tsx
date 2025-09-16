import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'financial';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  const variantStyles = {
    default: {
      card: 'bg-card border-border',
      icon: 'bg-primary/10 text-primary',
      value: 'text-foreground',
    },
    success: {
      card: 'bg-success/5 border-success/20',
      icon: 'bg-success/10 text-success',
      value: 'text-foreground',
    },
    warning: {
      card: 'bg-warning/5 border-warning/20',
      icon: 'bg-warning/10 text-warning',
      value: 'text-foreground',
    },
    danger: {
      card: 'bg-danger/5 border-danger/20',
      icon: 'bg-danger/10 text-danger',
      value: 'text-foreground',
    },
    financial: {
      card: 'bg-gradient-card border-primary/20',
      icon: 'bg-gradient-financial text-white',
      value: 'text-foreground font-bold',
    },
  };

  const styles = variantStyles[variant];

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('es-ES');
    }
    return val;
  };

  return (
    <Card className={cn(
      'shadow-card hover:shadow-financial transition-all duration-300 transform hover:scale-[1.02]',
      styles.card,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className={cn('text-3xl font-bold', styles.value)}>
              {formatValue(value)}
            </p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center text-sm mt-2 font-medium',
                trend.isPositive ? 'text-success' : 'text-danger'
              )}>
                <span className="mr-1">
                  {trend.isPositive ? '↗' : '↘'}
                </span>
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground ml-1">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
            styles.icon
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;