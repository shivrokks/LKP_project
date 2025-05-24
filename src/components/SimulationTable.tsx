
import { SimulationLog } from '@/types/scheduler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface SimulationTableProps {
  logs: SimulationLog[];
}

const SimulationTable = ({ logs }: SimulationTableProps) => {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          Execution Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Core</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{log.taskId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Core {log.coreAssigned}</Badge>
                  </TableCell>
                  <TableCell>{log.startTime}ms</TableCell>
                  <TableCell>{log.duration}ms</TableCell>
                  <TableCell>{log.endTime}ms</TableCell>
                  <TableCell>
                    {log.missedDeadline ? (
                      <Badge variant="destructive">Missed Deadline</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600">On Time</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationTable;
