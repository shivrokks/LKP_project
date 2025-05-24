
import { ScheduleEntry } from '@/types/scheduler';
import { Card } from '@/components/ui/card';

interface GanttChartProps {
  schedule: ScheduleEntry[];
  numCores: number;
  totalTime: number;
  currentTime: number;
}

const GanttChart = ({ schedule, numCores, totalTime, currentTime }: GanttChartProps) => {
  const timelineWidth = 800;
  const coreHeight = 60;
  const margin = { top: 20, right: 40, bottom: 40, left: 60 };

  const getTimePosition = (time: number) => {
    return (time / totalTime) * timelineWidth;
  };

  const getCurrentTimePosition = () => {
    return getTimePosition(currentTime);
  };

  // Group schedule entries by core
  const scheduleByCore = Array.from({ length: numCores }, (_, i) => 
    schedule.filter(entry => entry.coreId === i)
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg 
        width={timelineWidth + margin.left + margin.right} 
        height={numCores * coreHeight + margin.top + margin.bottom}
        className="border rounded-lg bg-white dark:bg-gray-800"
      >
        {/* Time axis */}
        <g transform={`translate(${margin.left}, ${margin.top + numCores * coreHeight})`}>
          <line x1={0} y1={0} x2={timelineWidth} y2={0} stroke="currentColor" strokeWidth={1} />
          {Array.from({ length: Math.min(totalTime + 1, 21) }, (_, i) => {
            const time = (i * totalTime) / Math.min(totalTime, 20);
            const x = getTimePosition(time);
            return (
              <g key={i}>
                <line x1={x} y1={0} x2={x} y2={5} stroke="currentColor" strokeWidth={1} />
                <text x={x} y={20} textAnchor="middle" className="text-xs fill-current">
                  {Math.round(time)}
                </text>
              </g>
            );
          })}
          <text x={timelineWidth / 2} y={35} textAnchor="middle" className="text-sm font-medium fill-current">
            Time (ms)
          </text>
        </g>

        {/* Core labels and timelines */}
        {Array.from({ length: numCores }, (_, coreIndex) => (
          <g key={coreIndex} transform={`translate(0, ${margin.top + coreIndex * coreHeight})`}>
            {/* Core label */}
            <text x={margin.left - 10} y={coreHeight / 2} textAnchor="end" alignmentBaseline="middle" 
                  className="text-sm font-medium fill-current">
              Core {coreIndex}
            </text>
            
            {/* Core timeline background */}
            <rect 
              x={margin.left} 
              y={5} 
              width={timelineWidth} 
              height={coreHeight - 10}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={1}
              rx={4}
            />
            
            {/* Task blocks */}
            {scheduleByCore[coreIndex].map((entry, index) => (
              <g key={`${entry.taskId}-${index}`}>
                <rect
                  x={margin.left + getTimePosition(entry.startTime)}
                  y={8}
                  width={getTimePosition(entry.duration)}
                  height={coreHeight - 16}
                  fill={entry.color}
                  rx={3}
                  className="gantt-task cursor-pointer"
                  opacity={entry.endTime <= currentTime ? 1 : 0.3}
                >
                  <title>{`${entry.taskId}: ${entry.startTime}-${entry.endTime}ms`}</title>
                </rect>
                {getTimePosition(entry.duration) > 30 && (
                  <text
                    x={margin.left + getTimePosition(entry.startTime) + getTimePosition(entry.duration) / 2}
                    y={coreHeight / 2}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="text-xs font-medium fill-white"
                    opacity={entry.endTime <= currentTime ? 1 : 0.3}
                  >
                    {entry.taskId}
                  </text>
                )}
              </g>
            ))}
          </g>
        ))}

        {/* Current time indicator */}
        {currentTime < totalTime && (
          <g>
            <line
              x1={margin.left + getCurrentTimePosition()}
              y1={margin.top}
              x2={margin.left + getCurrentTimePosition()}
              y2={margin.top + numCores * coreHeight}
              stroke="#ef4444"
              strokeWidth={2}
              className="animate-pulse-slow"
            />
            <text
              x={margin.left + getCurrentTimePosition()}
              y={margin.top - 5}
              textAnchor="middle"
              className="text-xs font-bold fill-red-500"
            >
              {currentTime}ms
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default GanttChart;
