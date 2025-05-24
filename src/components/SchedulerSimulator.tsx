
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Play, Square, Download, Moon, Sun } from 'lucide-react';
import { Task, SimulationConfig, ScheduleEntry, SimulationLog, SimulationStats } from '@/types/scheduler';
import { PartitionedScheduler, exportToCSV } from '@/utils/scheduler';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/hooks/use-toast';
import GanttChart from './GanttChart';
import SimulationTable from './SimulationTable';
import StatsPanel from './StatsPanel';

const SchedulerSimulator = () => {
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({ id: '', executionTime: 0, period: 0 });
  const [config, setConfig] = useState<SimulationConfig>({ numCores: 2, totalTime: 20, realtimeMode: false });
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [stats, setStats] = useState<SimulationStats | null>(null);

  const addTask = () => {
    if (!newTask.id || newTask.executionTime <= 0 || newTask.period <= 0) {
      toast({ title: "Invalid Task", description: "Please fill all fields with valid values" });
      return;
    }
    
    if (tasks.some(task => task.id === newTask.id)) {
      toast({ title: "Duplicate Task ID", description: "Task ID must be unique" });
      return;
    }

    setTasks([...tasks, { ...newTask }]);
    setNewTask({ id: '', executionTime: 0, period: 0 });
    toast({ title: "Task Added", description: `Task ${newTask.id} added successfully` });
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({ title: "Task Removed", description: `Task ${taskId} removed` });
  };

  const startSimulation = useCallback(() => {
    if (tasks.length === 0) {
      toast({ title: "No Tasks", description: "Please add at least one task to simulate" });
      return;
    }

    const scheduler = new PartitionedScheduler(tasks, config.numCores, config.totalTime);
    const result = scheduler.simulate();
    
    setSchedule(result.schedule);
    setLogs(result.logs);
    setStats(result.stats);
    setIsRunning(true);
    setCurrentTime(0);

    toast({ title: "Simulation Started", description: `Simulating ${tasks.length} tasks on ${config.numCores} cores` });
  }, [tasks, config]);

  const stopSimulation = () => {
    setIsRunning(false);
    setCurrentTime(0);
    toast({ title: "Simulation Stopped", description: "Simulation has been reset" });
  };

  const downloadCSV = () => {
    if (logs.length === 0) {
      toast({ title: "No Data", description: "Run a simulation first to generate logs" });
      return;
    }

    const csvContent = exportToCSV(logs);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation_logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "CSV Downloaded", description: "Simulation logs exported successfully" });
  };

  // Real-time simulation effect
  useEffect(() => {
    if (!isRunning || !config.realtimeMode) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= config.totalTime) {
          setIsRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, config.realtimeMode, config.totalTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Real-Time Scheduler Simulator
            </h1>
            <p className="text-muted-foreground mt-2">Multi-core partitioned scheduling with real-time visualization</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <div className="flex items-center space-x-2">
              <Label htmlFor="realtime">Real-time</Label>
              <Switch
                id="realtime"
                checked={config.realtimeMode}
                onCheckedChange={(checked) => setConfig({ ...config, realtimeMode: checked })}
              />
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Input */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                Add Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="taskId">Task ID</Label>
                  <Input
                    id="taskId"
                    placeholder="e.g., T1"
                    value={newTask.id}
                    onChange={(e) => setNewTask({ ...newTask, id: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="execTime">Execution Time</Label>
                  <Input
                    id="execTime"
                    type="number"
                    placeholder="ms"
                    value={newTask.executionTime || ''}
                    onChange={(e) => setNewTask({ ...newTask, executionTime: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="period">Period</Label>
                  <Input
                    id="period"
                    type="number"
                    placeholder="ms"
                    value={newTask.period || ''}
                    onChange={(e) => setNewTask({ ...newTask, period: Number(e.target.value) })}
                  />
                </div>
              </div>
              <Button onClick={addTask} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>

              {/* Task List */}
              {tasks.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm font-medium">{task.id}: {task.executionTime}ms / {task.period}ms</span>
                      <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simulation Configuration */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Simulation Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numCores">Number of CPU Cores</Label>
                  <Input
                    id="numCores"
                    type="number"
                    min="1"
                    max="8"
                    value={config.numCores}
                    onChange={(e) => setConfig({ ...config, numCores: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="totalTime">Total Simulation Time (ms)</Label>
                  <Input
                    id="totalTime"
                    type="number"
                    min="1"
                    value={config.totalTime}
                    onChange={(e) => setConfig({ ...config, totalTime: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={startSimulation} 
                  disabled={isRunning}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </Button>
                <Button onClick={stopSimulation} disabled={!isRunning} variant="outline">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
                <Button onClick={downloadCSV} variant="outline" disabled={logs.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>

              {config.realtimeMode && isRunning && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    Time: {currentTime}ms / {config.totalTime}ms
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(currentTime / config.totalTime) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gantt Chart */}
        {schedule.length > 0 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Gantt Chart Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <GanttChart 
                schedule={schedule} 
                numCores={config.numCores} 
                totalTime={config.totalTime}
                currentTime={config.realtimeMode ? currentTime : config.totalTime}
              />
            </CardContent>
          </Card>
        )}

        {/* Statistics and Logs */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsPanel stats={stats} />
            <SimulationTable logs={logs} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulerSimulator;
