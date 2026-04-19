import * as React from 'react';
import { ChevronRight, ChevronDown, Folder, Plus, Edit2, Trash2, MoreVertical, Layers, Repeat, Clock } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FolderNode, FolderType } from '../types';
import { cn } from '@/lib/utils';

interface FolderItemProps {
  node: FolderNode;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: (parentId: string, type: FolderType) => void;
  onEdit: (node: FolderNode) => void;
  onDelete: (nodeId: string) => void;
  onOpenScheduler: () => void;
}

const getTypeIcon = (type: FolderType) => {
  switch (type) {
    case 'template': return <Repeat className="w-4 h-4 text-blue-500" />;
    case 'cycle': return <Layers className="w-4 h-4 text-purple-500" />;
    case 'stage': return <ChevronRight className="w-4 h-4 text-orange-500" />;
    default: return <Folder className="w-4 h-4 text-yellow-500" />;
  }
};

const getNextType = (currentType: FolderType): FolderType => {
  switch (currentType) {
    case 'template': return 'cycle';
    case 'cycle': return 'stage';
    case 'stage': return 'folder';
    default: return 'folder';
  }
};

export const FolderItem: React.FC<FolderItemProps> = ({
  node,
  level,
  isExpanded,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onOpenScheduler,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const nextType = getNextType(node.type);

  return (
    <div
      className={cn(
        "group flex items-center py-1.5 px-2 rounded-md hover:bg-accent transition-colors cursor-pointer",
        level === 0 ? "font-semibold text-lg" : "text-sm"
      )}
      style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2 flex-1">
        {hasChildren ? (
          isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <div className="w-4" />
        )}
        
        {getTypeIcon(node.type)}
        
        <span className="truncate">{node.name}</span>
        
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
          {node.type}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onAdd(node.id, nextType)}
          title={`Add ${nextType}`}
        >
          <Plus className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "h-7 w-7")}>
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(node)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            {node.type === 'template' && (
              <DropdownMenuItem onClick={onOpenScheduler}>
                <Clock className="w-4 h-4 mr-2" />
                Date Scheduler
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(node.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
