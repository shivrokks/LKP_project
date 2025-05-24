
import { SimulationStats } from '@/types/scheduler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, AlertTriangle, Clock, Cpu } from 'lucide-react';

interface StatsPanelProps {
  stats: SimulationStats;
}

const StatsPanel = ({ stats }: StatsPanelProps) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Performance Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Utilizations */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Core Utilization
          </h4>
          <div className="space-y-3">
            {stats.coreUtilizations.map((core) => (
              <div key={core.coreId} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Core {core.coreId}</span>
                  <span className="font-medium">{core.utilization}%</span>
                </div>
                <Progress 
                  value={core.utilization} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Deadline Misses</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.totalDeadlineMisses}
              {stats.totalDeadlineMisses > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {((stats.totalDeadlineMisses / stats.totalTasks) * 100).toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Avg Response Time</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.averageResponseTime}ms
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Tasks</span>
            </div>
            <div className="text-2xl font-bold">
              {stats.totalTasks}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">System Utilization</span>
            </div>
            <div className="text-2xl font-bold">
              {(stats.coreUtilizations.reduce((sum, core) => sum + core.utilization, 0) / stats.coreUtilizations.length).toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsPanel;
