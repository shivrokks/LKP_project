
import { Task, ScheduleEntry, SimulationLog, SimulationStats, CoreUtilization } from '@/types/scheduler';

const TASK_COLORS = [
  '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#f97316', '#84cc16', '#6366f1'
];

export class PartitionedScheduler {
  private tasks: Task[];
  private numCores: number;
  private totalTime: number;
  private schedule: ScheduleEntry[];
  private logs: SimulationLog[];
  private coreAssignments: Map<string, number>;

  constructor(tasks: Task[], numCores: number, totalTime: number) {
    this.tasks = tasks;
    this.numCores = numCores;
    this.totalTime = totalTime;
    this.schedule = [];
    this.logs = [];
    this.coreAssignments = new Map();
    this.assignTasksToCores();
  }

  private assignTasksToCores(): void {
    // Simple partitioning: assign tasks to cores in round-robin fashion
    // In a real implementation, you'd use more sophisticated algorithms like First-Fit Decreasing
    this.tasks.forEach((task, index) => {
      const coreId = index % this.numCores;
      this.coreAssignments.set(task.id, coreId);
    });
  }

  private getTaskColor(taskId: string): string {
    const index = this.tasks.findIndex(task => task.id === taskId);
    return TASK_COLORS[index % TASK_COLORS.length];
  }

  public simulate(): { schedule: ScheduleEntry[], logs: SimulationLog[], stats: SimulationStats } {
    // Create core timelines
    const coreTimelines: number[] = new Array(this.numCores).fill(0);
    
    // Generate task instances based on periods
    const taskInstances: Array<{ taskId: string, arrivalTime: number, deadline: number, executionTime: number }> = [];
    
    this.tasks.forEach(task => {
      for (let time = 0; time < this.totalTime; time += task.period) {
        taskInstances.push({
          taskId: task.id,
          arrivalTime: time,
          deadline: time + (task.deadline || task.period),
          executionTime: task.executionTime
        });
      }
    });

    // Sort by arrival time
    taskInstances.sort((a, b) => a.arrivalTime - b.arrivalTime);

    // Schedule tasks
    taskInstances.forEach(instance => {
      const coreId = this.coreAssignments.get(instance.taskId)!;
      const startTime = Math.max(instance.arrivalTime, coreTimelines[coreId]);
      const endTime = startTime + instance.executionTime;

      // Check if we can fit this task within simulation time
      if (endTime <= this.totalTime) {
        const scheduleEntry: ScheduleEntry = {
          taskId: instance.taskId,
          coreId,
          startTime,
          duration: instance.executionTime,
          endTime,
          color: this.getTaskColor(instance.taskId)
        };

        this.schedule.push(scheduleEntry);

        const logEntry: SimulationLog = {
          taskId: instance.taskId,
          coreAssigned: coreId,
          startTime,
          duration: instance.executionTime,
          endTime,
          deadline: instance.deadline,
          missedDeadline: endTime > instance.deadline
        };

        this.logs.push(logEntry);
        coreTimelines[coreId] = endTime;
      }
    });

    const stats = this.calculateStats();
    return { schedule: this.schedule, logs: this.logs, stats };
  }

  private calculateStats(): SimulationStats {
    const coreUtilizations: CoreUtilization[] = [];
    
    for (let i = 0; i < this.numCores; i++) {
      const coreEntries = this.schedule.filter(entry => entry.coreId === i);
      const totalExecutionTime = coreEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const utilization = (totalExecutionTime / this.totalTime) * 100;
      
      coreUtilizations.push({
        coreId: i,
        totalTime: totalExecutionTime,
        utilization: parseFloat(utilization.toFixed(2))
      });
    }

    const deadlineMisses = this.logs.filter(log => log.missedDeadline).length;
    const responseTimes = this.logs.map(log => log.endTime - log.startTime);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return {
      coreUtilizations,
      totalDeadlineMisses: deadlineMisses,
      averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
      totalTasks: this.logs.length
    };
  }
}

export const exportToCSV = (logs: SimulationLog[]): string => {
  const headers = ['Task ID', 'Core Assigned', 'Start Time', 'Duration', 'End Time', 'Deadline', 'Missed Deadline'];
  const rows = logs.map(log => [
    log.taskId,
    log.coreAssigned,
    log.startTime,
    log.duration,
    log.endTime,
    log.deadline || '',
    log.missedDeadline ? 'Yes' : 'No'
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};
