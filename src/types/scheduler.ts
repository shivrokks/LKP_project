
export interface Task {
  id: string;
  executionTime: number;
  period: number;
  deadline?: number;
  priority?: number;
}

export interface SimulationConfig {
  numCores: number;
  totalTime: number;
  realtimeMode: boolean;
}

export interface ScheduleEntry {
  taskId: string;
  coreId: number;
  startTime: number;
  duration: number;
  endTime: number;
  color: string;
}

export interface SimulationLog {
  taskId: string;
  coreAssigned: number;
  startTime: number;
  duration: number;
  endTime: number;
  deadline?: number;
  missedDeadline?: boolean;
}

export interface CoreUtilization {
  coreId: number;
  totalTime: number;
  utilization: number;
}

export interface SimulationStats {
  coreUtilizations: CoreUtilization[];
  totalDeadlineMisses: number;
  averageResponseTime: number;
  totalTasks: number;
}
