import * as React from 'react';
import { format, addDays, subDays, addMonths, subMonths, parseISO, isBefore, isAfter } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderNode, DateVariable, ClientInstance } from '../types';
import { cn } from '@/lib/utils';

interface ClientSchedulerProps {
  folders: FolderNode[];
  variables: DateVariable[];
  client: ClientInstance;
  onToggleComplete: (folderId: string) => void;
}

export const ClientScheduler: React.FC<ClientSchedulerProps> = ({
  folders,
  variables,
  client,
  onToggleComplete,
}) => {
  const calculateDeadline = (node: FolderNode) => {
    if (!node.schedulingRule) return null;
    const { variableId, offsetValue, offsetUnit, type } = node.schedulingRule;
    const baseDateStr = client.variableValues[variableId];
    if (!baseDateStr) return null;

    const baseDate = parseISO(baseDateStr);
    
    if (offsetUnit === 'months') {
      return type === 'before' ? subMonths(baseDate, offsetValue) : addMonths(baseDate, offsetValue);
    }
    
    return type === 'before' ? subDays(baseDate, offsetValue) : addDays(baseDate, offsetValue);
  };

  const getStatus = (node: FolderNode, deadline: Date | null) => {
    const state = client.folderStates[node.id];
    if (state?.isCompleted) return 'completed';
    if (!deadline) return 'pending';
    
    const now = new Date();
    if (isBefore(deadline, now)) return 'overdue';
    return 'upcoming';
  };

  const scheduledFolders = folders
    .filter((f) => f.type === 'folder' && f.schedulingRule)
    .map((f) => {
      const deadline = calculateDeadline(f);
      return {
        ...f,
        deadline,
        status: getStatus(f, deadline),
      };
    })
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variables.map((v) => (
          <Card key={v.id} className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{v.name}</p>
                  <p className="text-sm font-bold">
                    {client.variableValues[v.id] 
                      ? format(parseISO(client.variableValues[v.id]), 'PPP')
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Project Schedule
          </CardTitle>
          <CardDescription>
            Deadlines calculated based on template rules and input dates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {scheduledFolders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No scheduled folders found in this template.</p>
                </div>
              ) : (
                scheduledFolders.map((node) => (
                  <div
                    key={node.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      node.status === 'overdue' ? "bg-destructive/5 border-destructive/20" : "bg-card"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => onToggleComplete(node.id)}
                        className="transition-transform active:scale-95"
                      >
                        {client.folderStates[node.id]?.isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </button>
                      <div>
                        <p className={cn(
                          "font-semibold",
                          client.folderStates[node.id]?.isCompleted && "line-through text-muted-foreground"
                        )}>
                          {node.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {variables.find(v => v.id === node.schedulingRule?.variableId)?.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {node.schedulingRule?.offsetValue} {node.schedulingRule?.offsetUnit} {node.schedulingRule?.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-bold",
                        node.status === 'overdue' ? "text-destructive" : "text-foreground"
                      )}>
                        {node.deadline ? format(node.deadline, 'MMM d, yyyy') : 'No deadline'}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        {node.status === 'overdue' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-destructive uppercase">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                        {node.status === 'completed' && (
                          <span className="text-[10px] font-bold text-green-600 uppercase">
                            Completed
                          </span>
                        )}
                        {node.status === 'upcoming' && (
                          <span className="text-[10px] font-bold text-blue-500 uppercase">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
