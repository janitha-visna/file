import * as React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FolderNode, DateVariable, SchedulingRule } from '../types';
import { CalendarDays, Clock, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

interface TemplateSchedulerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderNode[];
  dateVariables: DateVariable[];
  onUpdateRules: (updates: { id: string; rule?: SchedulingRule }[]) => void;
  onUpdateVariables: (variables: DateVariable[]) => void;
}

export const TemplateSchedulerDialog: React.FC<TemplateSchedulerDialogProps> = ({
  isOpen,
  onClose,
  folders,
  dateVariables,
  onUpdateRules,
  onUpdateVariables,
}) => {
  const [localRules, setLocalRules] = React.useState<Record<string, SchedulingRule | undefined>>({});
  const [localVariables, setLocalVariables] = React.useState<DateVariable[]>([]);
  const [newVarName, setNewVarName] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      const initialRules: Record<string, SchedulingRule | undefined> = {};
      folders.forEach(f => {
        if (f.type === 'folder') {
          initialRules[f.id] = f.schedulingRule;
        }
      });
      setLocalRules(initialRules);
      setLocalVariables(dateVariables);
    }
  }, [isOpen, folders, dateVariables]);

  const handleUpdateRule = (folderId: string, field: keyof SchedulingRule, value: any) => {
    setLocalRules(prev => {
      const current = prev[folderId] || { variableId: '', offsetValue: 0, offsetUnit: 'days', type: 'before' };
      return {
        ...prev,
        [folderId]: { ...current, [field]: value }
      };
    });
  };

  const handleToggleRule = (folderId: string, enabled: boolean) => {
    setLocalRules(prev => ({
      ...prev,
      [folderId]: enabled ? { variableId: '', offsetValue: 0, offsetUnit: 'days', type: 'before' } : undefined
    }));
  };

  const handleAddVariable = () => {
    if (newVarName.trim()) {
      const newVar: DateVariable = {
        id: Math.random().toString(36).substr(2, 9),
        name: newVarName.trim(),
      };
      setLocalVariables([...localVariables, newVar]);
      setNewVarName('');
    }
  };

  const handleRemoveVariable = (id: string) => {
    setLocalVariables(localVariables.filter(v => v.id !== id));
    // Also clear any rules using this variable
    setLocalRules(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (next[key]?.variableId === id) {
          next[key] = undefined;
        }
      });
      return next;
    });
  };

  const handleSave = () => {
    const updates = Object.entries(localRules).map(([id, rule]) => ({
      id,
      rule
    }));
    onUpdateVariables(localVariables);
    onUpdateRules(updates);
    onClose();
  };

  const folderNodes = folders.filter(f => f.type === 'folder');
  const cycles = React.useMemo(() => folders.filter(f => f.type === 'cycle'), [folders]);
  
  const foldersByCycle = React.useMemo(() => {
    const groups: Record<string, FolderNode[]> = {};
    cycles.forEach(c => groups[c.id] = []);
    
    folderNodes.forEach(f => {
      // Trace up to find the cycle parent
      // Target structure: Folder -> Stage -> Cycle
      const stage = folders.find(n => n.id === f.parentId);
      if (stage) {
        const cycle = folders.find(n => n.id === stage.parentId && n.type === 'cycle');
        if (cycle) {
          groups[cycle.id].push(f);
        }
      }
    });
    return groups;
  }, [cycles, folderNodes, folders]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="w-6 h-6 text-primary" />
            Template Scheduler & Variables
          </DialogTitle>
          <DialogDescription>
            Manage date variables and scheduling rules for this template.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-6 pt-4 gap-6">
          {/* Variables Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              1. Define Template Variables
            </h3>
            <div className="flex items-end gap-2">
              <div className="grid gap-1.5 flex-1">
                <Label htmlFor="newVar" className="text-xs">New Variable Name</Label>
                <Input
                  id="newVar"
                  placeholder="e.g. Stage 1 Audit Date"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
                  className="h-9"
                />
              </div>
              <Button onClick={handleAddVariable} disabled={!newVarName.trim()} size="sm" className="h-9">
                <Plus className="w-4 h-4 mr-2" />
                Add Variable
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localVariables.map(v => (
                <div key={v.id} className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-full pl-3 pr-1 py-1">
                  <span className="text-xs font-medium text-primary">{v.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemoveVariable(v.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {localVariables.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No variables defined yet.</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Rules Section */}
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              2. Configure Folder Rules
            </h3>
            
            {cycles.length > 0 ? (
              <Tabs defaultValue={cycles[0].id} className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-fit justify-start h-9 bg-muted/50 p-1 mb-4 flex-shrink-0">
                  {cycles.map(cycle => (
                    <TabsTrigger key={cycle.id} value={cycle.id} className="text-xs px-3 h-7 capitalize data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      {cycle.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="flex-1 min-h-[300px] overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    {cycles.map(cycle => (
                      <TabsContent key={cycle.id} value={cycle.id} className="mt-0 outline-none">
                        <div className="space-y-3 pb-4">
                          {foldersByCycle[cycle.id]?.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
                              <p className="text-xs">No folders found in this cycle.</p>
                            </div>
                          ) : (
                            <div className="grid gap-2">
                              <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-background py-2 z-10">
                                <div className="col-span-4">Folder Name</div>
                                <div className="col-span-8">Scheduling Rule</div>
                              </div>
                              {foldersByCycle[cycle.id]?.map((folder) => {
                                const rule = localRules[folder.id];
                                return (
                                  <div key={folder.id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg border bg-muted/30 group hover:bg-muted/50 transition-colors">
                                    <div className="col-span-4 font-medium text-sm truncate">
                                      {folder.name}
                                    </div>
                                    <div className="col-span-8 flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={!!rule}
                                        onChange={(e) => handleToggleRule(folder.id, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                      />
                                      
                                      {rule ? (
                                        <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                          <Input
                                            type="number"
                                            className="w-16 h-8 text-xs font-mono"
                                            value={rule.offsetValue}
                                            onChange={(e) => handleUpdateRule(folder.id, 'offsetValue', parseInt(e.target.value) || 0)}
                                          />
                                          <Select
                                            value={rule.offsetUnit}
                                            onValueChange={(v) => handleUpdateRule(folder.id, 'offsetUnit', v)}
                                          >
                                            <SelectTrigger className="h-8 text-xs w-24">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="days">days</SelectItem>
                                              <SelectItem value="months">months</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <Select
                                            value={rule.type}
                                            onValueChange={(v) => handleUpdateRule(folder.id, 'type', v)}
                                          >
                                            <SelectTrigger className="h-8 text-xs w-24">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="before">before</SelectItem>
                                              <SelectItem value="after">after</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <Select
                                            value={rule.variableId}
                                            onValueChange={(v) => handleUpdateRule(folder.id, 'variableId', v)}
                                          >
                                            <SelectTrigger className="h-8 text-xs flex-1">
                                              <SelectValue placeholder="Select variable" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {localVariables.map(v => (
                                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-muted-foreground italic">No rule set</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </ScrollArea>
                </div>
              </Tabs>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium">No Cycles Found</p>
                <p className="text-xs text-muted-foreground">Add cycles to your template to configure folder rules.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="px-8">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
