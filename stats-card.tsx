import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    trend: "up" | "down";
    period: string;
  };
  className?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white arabic-numbers">
              {value}
            </p>
          </div>
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
            <Icon className="text-primary-600 dark:text-primary-400 w-6 h-6" />
          </div>
        </div>
        {change && (
          <div className="flex items-center gap-1">
            {change.trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-success-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-error-500" />
            )}
            <span className={cn(
              "text-sm font-medium",
              change.trend === "up" ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"
            )}>
              {change.value} {change.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
