import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  description?: string;
}

export const MetricCard = ({ title, value, change, changeType, icon, description }: MetricCardProps) => {
  return (
    <Card className="dashboard-card">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <div className="text-primary">
              {icon}
            </div>
          </div>
          
          {change !== undefined && (
            <div className={`flex items-center space-x-1 text-xs ${
              changeType === 'increase' ? 'text-success' : 'text-destructive'
            }`}>
              {changeType === 'increase' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};