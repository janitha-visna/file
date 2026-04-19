import * as React from 'react';
import {  TooltipProvider } from '@/components/ui/tooltip';
import { FolderNode, FolderType, Template, DateVariable, SchedulingRule, ClientInstance } from './types';
import { buildTree, deleteNodeRecursive } from './lib/folder-utils';
import { FolderTree } from './components/FolderTree';
import { AddFolderDialog } from './components/AddFolderDialog';
import { TemplateSchedulerDialog } from './components/TemplateSchedulerDialog';
import { INITIAL_CLIENTS,INITIAL_FOLDERS,INITIAL_TEMPLATES } from './feature/types/data';
import { useTheme } from './feature/utils/Usetheme';
import { AppToolbar } from './components/AppHeader';
import { AppContent } from './components/AppContent';


export default function App() {
  const [folders, setFolders] = React.useState<FolderNode[]>(INITIAL_FOLDERS);
  const [templates, setTemplates] = React.useState<Template[]>(INITIAL_TEMPLATES);
  const [clients, setClients] = React.useState<ClientInstance[]>(INITIAL_CLIENTS);
  const [activeTemplateId, setActiveTemplateId] = React.useState<string | null>(null);
  const [activeClientId, setActiveClientId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'admin' | 'client'>('admin');
  const { theme, toggleTheme } = useTheme();
  

  const [adminView, setAdminView] = React.useState<'list' | 'detail'>('list');

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = React.useState(false);
  const [dialogConfig, setDialogConfig] = React.useState<{
    parentId: string | null;
    type: FolderType;
    mode: 'add' | 'edit';
    nodeId?: string;
    initialValue?: string;
    initialSchedulingRule?: SchedulingRule;
  }>({ parentId: null, type: 'template', mode: 'add' });

  const activeTemplate = templates.find(t => t.id === activeTemplateId);
  const rootNode = folders.find(f => f.id === activeTemplate?.rootId);
  const activeClient = clients.find(c => c.id === activeClientId);
  
  const treeData = React.useMemo(() => {
    if (!rootNode) return [];
    return buildTree(folders, rootNode.parentId);
  }, [folders, rootNode]);

  const handleAdd = (parentId: string | null, type: FolderType) => {
    setDialogConfig({ parentId, type, mode: 'add' });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (node: FolderNode) => {
    setDialogConfig({
      parentId: node.parentId,
      type: node.type,
      mode: 'edit',
      nodeId: node.id,
      initialValue: node.name,
      initialSchedulingRule: node.schedulingRule,
    });
    setIsAddDialogOpen(true);
  };

  const handleRenameTemplate = (template: Template) => {
    const root = folders.find(f => f.id === template.rootId);
    if (!root) return;
    setDialogConfig({
      parentId: root.parentId,
      type: 'template',
      mode: 'edit',
      nodeId: root.id,
      initialValue: root.name,
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenSchedulerForTemplate = (template: Template) => {
    setActiveTemplateId(template.id);
    setIsSchedulerOpen(true);
  };

  const handleDelete = (nodeId: string) => {
    if (confirm('Are you sure you want to delete this folder and all its contents?')) {
      setFolders(prev => deleteNodeRecursive(prev, nodeId));
      const template = templates.find(t => t.rootId === nodeId);
      if (template) {
        setTemplates(prev => prev.filter(t => t.id !== template.id));
        if (activeTemplateId === template.id && templates.length > 1) {
          setActiveTemplateId(templates.find(t => t.id !== template.id)!.id);
        }
      }
    }
  };

  const handleDialogSubmit = (name: string, type: FolderType, schedulingRule?: SchedulingRule) => {
    if (dialogConfig.mode === 'add') {
      const newId = Math.random().toString(36).substr(2, 9);
      const newNode: FolderNode = {
        id: newId,
        name,
        type: type,
        parentId: dialogConfig.parentId,
        schedulingRule,
      };
      setFolders(prev => [...prev, newNode]);

      if (type === 'template') {
        const newTemplate: Template = {
          id: `temp-${newId}`,
          name,
          rootId: newId,
          dateVariables: [],
        };
        setTemplates(prev => [...prev, newTemplate]);
        setActiveTemplateId(newTemplate.id);
      }
    } else if (dialogConfig.mode === 'edit' && dialogConfig.nodeId) {
      setFolders(prev => prev.map(f => f.id === dialogConfig.nodeId ? { ...f, name, schedulingRule } : f));
      
      const template = templates.find(t => t.rootId === dialogConfig.nodeId);
      if (template) {
        setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, name } : t));
      }
    }
  };

  const handleUpdateVariables = (vars: DateVariable[]) => {
    setTemplates(prev => prev.map(t => t.id === activeTemplateId ? { ...t, dateVariables: vars } : t));
  };

  const handleLaunchClient = () => {
    if (!activeTemplate) return;
    const newId = `client-${Math.random().toString(36).substr(2, 9)}`;
    const newClient: ClientInstance = {
      id: newId,
      name: `New Client (${activeTemplate.name})`,
      templateId: activeTemplate.id,
      variableValues: {},
      folderStates: {},
    };
    setClients(prev => [...prev, newClient]);
    setActiveClientId(newId);
    setViewMode('client');
  };

  const handleUpdateClientDate = (varId: string, value: string) => {
    if (!activeClientId) return;
    setClients(prev => prev.map(c => c.id === activeClientId ? {
      ...c,
      variableValues: { ...c.variableValues, [varId]: value }
    } : c));
  };

  const handleToggleFolderComplete = (folderId: string) => {
    if (!activeClientId) return;
    setClients(prev => prev.map(c => {
      if (c.id !== activeClientId) return c;
      const currentState = c.folderStates[folderId];
      return {
        ...c,
        folderStates: {
          ...c.folderStates,
          [folderId]: {
            isCompleted: !currentState?.isCompleted,
            completedAt: !currentState?.isCompleted ? new Date().toISOString() : undefined
          }
        }
      };
    }));
  };

  const handleUpdateAllRules = (updates: { id: string; rule?: SchedulingRule }[]) => {
    setFolders(prev => {
      const newFolders = [...prev];
      updates.forEach(({ id, rule }) => {
        const index = newFolders.findIndex(f => f.id === id);
        if (index !== -1) {
          newFolders[index] = { ...newFolders[index], schedulingRule: rule };
        }
      });
      return newFolders;
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AppToolbar
            viewMode={viewMode}
            setViewMode={setViewMode}
            setAdminView={setAdminView}
            theme={theme}
            toggleTheme={toggleTheme}
            clients={clients}
            activeClientId={activeClientId}
            setActiveClientId={setActiveClientId}
          />

          <AppContent
            viewMode={viewMode}
            adminView={adminView}
            setAdminView={setAdminView}
            templates={templates}
            activeTemplateId={activeTemplateId}
            setActiveTemplateId={setActiveTemplateId}
            activeTemplate={activeTemplate}
            activeClient={activeClient}
            folders={folders}
            theme={theme}
            toggleTheme={toggleTheme}
            treeData={treeData}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRenameTemplate={handleRenameTemplate}
            onOpenSchedulerForTemplate={handleOpenSchedulerForTemplate}
            onLaunchClient={handleLaunchClient}
            onUpdateVariables={handleUpdateVariables}
            onUpdateClientDate={handleUpdateClientDate}
            onToggleFolderComplete={handleToggleFolderComplete}
            onUpdateAllRules={handleUpdateAllRules}
            setIsSchedulerOpen={setIsSchedulerOpen}
          />
        </main>

        <AddFolderDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleDialogSubmit}
          title={dialogConfig.mode === "add" ? `Add New Item` : `Rename Item`}
          initialType={dialogConfig.type}
          initialValue={dialogConfig.initialValue}
          initialSchedulingRule={dialogConfig.initialSchedulingRule}
          showTypeSelection={
            dialogConfig.mode === "add" && dialogConfig.type !== "template"
          }
          dateVariables={activeTemplate?.dateVariables || []}
        />

        <TemplateSchedulerDialog
          isOpen={isSchedulerOpen}
          onClose={() => setIsSchedulerOpen(false)}
          folders={folders.filter((f) => {
            // Only show folders that belong to the active template
            const templateRoot = activeTemplate?.rootId;
            if (!templateRoot) return false;

            // Simple check: is it a descendant of the root?
            // For now, we'll pass all folders and let the dialog handle it or filter here
            // A more robust check would involve traversing the tree
            return true;
          })}
          dateVariables={activeTemplate?.dateVariables || []}
          onUpdateRules={handleUpdateAllRules}
          onUpdateVariables={handleUpdateVariables}
        />
      </div>
    </TooltipProvider>
  );
}
