import * as React from 'react';
import { cn } from '@/lib/utils';
import { Plus, ChevronRight, FolderTree as TreeIcon, Rocket, Users, Pencil, Trash2, CalendarClock, MoreVertical, ArrowLeft, LayoutGrid, Clock, Sun, Moon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { FolderNode, FolderType, Template, DateVariable, SchedulingRule, ClientInstance } from './types';
import { buildTree, deleteNodeRecursive } from './lib/folder-utils';
import { FolderTree } from './components/FolderTree';
import { AddFolderDialog } from './components/AddFolderDialog';
import { TemplateSchedulerDialog } from './components/TemplateSchedulerDialog';
import { ClientScheduler } from './components/ClientScheduler';
import { Label } from '@/components/ui/label';
import { INITIAL_CLIENTS,INITIAL_FOLDERS,INITIAL_TEMPLATES } from './feature/types/data';
import { useTheme } from './feature/utils/Usetheme';
import { TemplateListView } from './components/TemplateListView';
import { AppToolbar } from './components/AppHeader';


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
          

          <div className="flex-1 overflow-auto p-6">
            {viewMode === "admin" ? (
              adminView === "list" ? (
                <TemplateListView
                  templates={templates}
                  folders={folders}
                  theme={theme}
                  toggleTheme={toggleTheme}
                  onCreateTemplate={() => handleAdd(null, "template")}
                  onOpenTemplate={(templateId) => {
                    setActiveTemplateId(templateId);
                    setAdminView("detail");
                  }}
                  onRenameTemplate={handleRenameTemplate}
                  onOpenScheduler={handleOpenSchedulerForTemplate}
                  onDeleteTemplate={handleDelete}
                />
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span
                          className="cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => setAdminView("list")}
                        >
                          Templates
                        </span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground font-medium">
                          {activeTemplate?.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAdminView("list")}
                        className="gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to List
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-bold tracking-tight">
                        {activeTemplate?.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleTheme}
                          className="h-9 w-9 rounded-lg mr-2"
                        >
                          {theme === "light" ? (
                            <Moon className="w-[1.2rem] h-[1.2rem]" />
                          ) : (
                            <Sun className="w-[1.2rem] h-[1.2rem]" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsSchedulerOpen(true)}
                          className="gap-2 h-9"
                        >
                          <CalendarClock className="w-4 h-4" />
                          Scheduler
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            activeTemplate &&
                            handleRenameTemplate(activeTemplate)
                          }
                          className="h-9"
                        >
                          Rename
                        </Button>
                        <Button
                          onClick={handleLaunchClient}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 h-9 ml-2"
                        >
                          <Rocket className="w-4 h-4 mr-2" />
                          Launch Client
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Card className="border-none shadow-sm bg-muted/20">
                    <CardHeader className="pb-3 px-6">
                      <CardTitle className="text-lg">
                        Hierarchy Designer
                      </CardTitle>
                      <CardDescription>
                        Add cycles, stages, and folders. Attach scheduling rules
                        to folders.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="bg-background rounded-xl border p-4 min-h-[500px]">
                        {treeData.length > 0 ? (
                          <FolderTree
                            nodes={treeData}
                            onAdd={handleAdd}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onOpenScheduler={() => setIsSchedulerOpen(true)}
                          />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <TreeIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <Button
                              variant="outline"
                              onClick={() =>
                                rootNode && handleAdd(rootNode.id, "cycle")
                              }
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add First Cycle
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            ) : (
              <div className="max-w-5xl mx-auto space-y-6">
                {activeClient ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Clients</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground font-medium">
                          {activeClient.name}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold tracking-tight">
                        {activeClient.name} Workspace
                      </h2>
                      <p className="text-muted-foreground">
                        Manage deadlines and document completion for this
                        client.
                      </p>
                    </div>

                    <Tabs defaultValue="schedule" className="space-y-6">
                      <TabsList>
                        <TabsTrigger value="schedule">
                          Schedule View
                        </TabsTrigger>
                        <TabsTrigger value="setup">Setup Dates</TabsTrigger>
                      </TabsList>

                      <TabsContent value="schedule">
                        <ClientScheduler
                          folders={folders}
                          variables={
                            templates.find(
                              (t) => t.id === activeClient.templateId
                            )?.dateVariables || []
                          }
                          client={activeClient}
                          onToggleComplete={handleToggleFolderComplete}
                        />
                      </TabsContent>

                      <TabsContent value="setup">
                        <Card>
                          <CardHeader>
                            <CardTitle>Input Required Dates</CardTitle>
                            <CardDescription>
                              Enter the actual dates for this client to
                              calculate the schedule.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {templates
                              .find((t) => t.id === activeClient.templateId)
                              ?.dateVariables.map((v) => (
                                <div key={v.id} className="grid gap-2">
                                  <Label htmlFor={v.id}>{v.name}</Label>
                                  <Input
                                    id={v.id}
                                    type="date"
                                    value={
                                      activeClient.variableValues[v.id] || ""
                                    }
                                    onChange={(e) =>
                                      handleUpdateClientDate(
                                        v.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              ))}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                    <Users className="w-12 h-12 text-muted-foreground" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Select a Client</h3>
                      <p className="text-muted-foreground">
                        Choose a client from the header dropdown or launch a new
                        one from a template.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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
