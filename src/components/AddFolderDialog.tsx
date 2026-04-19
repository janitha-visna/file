import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateVariable, FolderType, SchedulingRule } from '../types';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: FolderType, schedulingRule?: SchedulingRule) => void;
  title: string;
  initialValue?: string;
  initialType?: FolderType;
  initialSchedulingRule?: SchedulingRule;
  showTypeSelection?: boolean;
  dateVariables?: DateVariable[];
}

export const AddFolderDialog: React.FC<AddFolderDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialValue = '',
  initialType = 'folder',
  initialSchedulingRule,
  showTypeSelection = false,
  dateVariables = [],
}) => {
  const [name, setName] = React.useState(initialValue);
  const [selectedType, setSelectedType] = React.useState<FolderType>(initialType);
  const [useScheduling, setUseScheduling] = React.useState(!!initialSchedulingRule);
  const [schedulingRule, setSchedulingRule] = React.useState<SchedulingRule>(
    initialSchedulingRule || { variableId: '', offsetValue: 0, offsetUnit: 'days', type: 'before' }
  );

  React.useEffect(() => {
    if (isOpen) {
      setName(initialValue);
      setSelectedType(initialType);
      setUseScheduling(!!initialSchedulingRule);
      setSchedulingRule(initialSchedulingRule || { variableId: '', offsetValue: 0, offsetUnit: 'days', type: 'before' });
    }
  }, [isOpen, initialValue, initialType, initialSchedulingRule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), selectedType, useScheduling ? schedulingRule : undefined);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {showTypeSelection && (
              <div className="grid gap-2">
                <Label htmlFor="type">Item Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as FolderType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cycle">Cycle</SelectItem>
                    <SelectItem value="stage">Stage</SelectItem>
                    <SelectItem value="folder">Folder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">
                {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${selectedType} name...`}
                autoFocus
              />
            </div>

            {selectedType === 'folder' && dateVariables.length > 0 && (
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useScheduling"
                    checked={useScheduling}
                    onChange={(e) => setUseScheduling(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="useScheduling" className="text-sm font-medium">
                    Enable scheduling rule
                  </Label>
                </div>

                {useScheduling && (
                  <div className="grid gap-3 pl-6 border-l-2 border-muted">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Variable</Label>
                      <Select
                        value={schedulingRule.variableId}
                        onValueChange={(v) => setSchedulingRule({ ...schedulingRule, variableId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select variable" />
                        </SelectTrigger>
                        <SelectContent>
                          {dateVariables.map((v) => (
                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20 h-9"
                        value={schedulingRule.offsetValue}
                        onChange={(e) => setSchedulingRule({ ...schedulingRule, offsetValue: parseInt(e.target.value) || 0 })}
                      />
                      <Select
                        value={schedulingRule.offsetUnit}
                        onValueChange={(v) => setSchedulingRule({ ...schedulingRule, offsetUnit: v as 'days' | 'months' })}
                      >
                        <SelectTrigger className="w-24 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">days</SelectItem>
                          <SelectItem value="months">months</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={schedulingRule.type}
                        onValueChange={(v) => setSchedulingRule({ ...schedulingRule, type: v as 'before' | 'after' })}
                      >
                        <SelectTrigger className="w-24 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before">before</SelectItem>
                          <SelectItem value="after">after</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || (useScheduling && !schedulingRule.variableId)}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
