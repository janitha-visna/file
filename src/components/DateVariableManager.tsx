import * as React from 'react';
import { Plus, Trash2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateVariable } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DateVariableManagerProps {
  variables: DateVariable[];
  onChange: (variables: DateVariable[]) => void;
}

export const DateVariableManager: React.FC<DateVariableManagerProps> = ({
  variables,
  onChange,
}) => {
  const [newName, setNewName] = React.useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      const newVar: DateVariable = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName.trim(),
      };
      onChange([...variables, newVar]);
      setNewName('');
    }
  };

  const handleRemove = (id: string) => {
    onChange(variables.filter((v) => v.id !== id));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          Date Variables
        </CardTitle>
        <CardDescription>
          Define dates that users must input when using this template.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="grid gap-1.5 flex-1">
            <Label htmlFor="varName" className="text-xs">Variable Name</Label>
            <Input
              id="varName"
              placeholder="e.g. Stage 1 Audit Date"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={!newName.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {variables.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">No variables defined.</p>
          ) : (
            variables.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border group">
                <span className="text-sm font-medium">{v.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(v.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
