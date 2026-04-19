export type FolderType = 'template' | 'cycle' | 'stage' | 'folder';

export interface DateVariable {
  id: string;
  name: string;
  description?: string;
}

export interface SchedulingRule {
  variableId: string;
  offsetValue: number;
  offsetUnit: 'days' | 'months';
  type: 'before' | 'after';
}

export interface FolderNode {
  id: string;
  name: string;
  type: FolderType;
  parentId: string | null;
  children?: FolderNode[];
  schedulingRule?: SchedulingRule;
  isCompleted?: boolean;
  completedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  rootId: string;
  dateVariables: DateVariable[];
}

export interface ClientInstance {
  id: string;
  name: string;
  templateId: string;
  variableValues: Record<string, string>; // variableId -> ISO date string
  folderStates: Record<string, { isCompleted: boolean; completedAt?: string }>;
}
