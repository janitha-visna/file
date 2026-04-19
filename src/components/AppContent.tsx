import * as React from "react";
import {
  ChevronRight,
  ArrowLeft,
  Plus,
  Rocket,
  LayoutGrid,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { FolderTree } from "./FolderTree";
import { ClientScheduler } from "./ClientScheduler";
import { TemplateListView } from "./TemplateListView";

import {
  FolderNode,
  FolderType,
  Template,
  DateVariable,
  SchedulingRule,
  ClientInstance,
} from "../types";

type AppContentProps = {
  viewMode: "admin" | "client";
  adminView: "list" | "detail";
  setAdminView: React.Dispatch<React.SetStateAction<"list" | "detail">>;

  templates: Template[];
  activeTemplateId: string | null;
  setActiveTemplateId: React.Dispatch<React.SetStateAction<string | null>>;
  activeTemplate: Template | undefined;

  activeClient: ClientInstance | undefined;
  folders: FolderNode[];
  theme: "light" | "dark";
  toggleTheme: () => void;
  treeData: FolderNode[];

  onAdd: (parentId: string | null, type: FolderType) => void;
  onEdit: (node: FolderNode) => void;
  onDelete: (nodeId: string) => void;
  onRenameTemplate: (template: Template) => void;
  onOpenSchedulerForTemplate: (template: Template) => void;
  onLaunchClient: () => void;
  onUpdateVariables: (vars: DateVariable[]) => void;
  onUpdateClientDate: (varId: string, value: string) => void;
  onToggleFolderComplete: (folderId: string) => void;
  onUpdateAllRules: (updates: { id: string; rule?: SchedulingRule }[]) => void;
  setIsSchedulerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AppContent({
  viewMode,
  adminView,
  setAdminView,
  templates,
  activeTemplateId,
  setActiveTemplateId,
  activeTemplate,
  activeClient,
  folders,
  theme,
  toggleTheme,
  treeData,
  onAdd,
  onEdit,
  onDelete,
  onRenameTemplate,
  onOpenSchedulerForTemplate,
  onLaunchClient,
  onUpdateVariables,
  onUpdateClientDate,
  onToggleFolderComplete,
  onUpdateAllRules,
  setIsSchedulerOpen,
}: AppContentProps) {
  if (viewMode === "admin") {
    if (adminView === "list") {
      return (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            

            <TemplateListView
              templates={templates}
              folders={folders}
              theme={theme}
              toggleTheme={toggleTheme}
              onCreateTemplate={() => onAdd(null, "template")}
              onOpenTemplate={(templateId) => {
                setActiveTemplateId(templateId);
                setAdminView("detail");
              }}
              onRenameTemplate={onRenameTemplate}
              onOpenScheduler={onOpenSchedulerForTemplate}
              onDeleteTemplate={onDelete}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAdminView("list")}
                className="mb-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to list
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Templates</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">
                  {activeTemplate?.name ?? "No template selected"}
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight">
                Template Designer
              </h2>

              <p className="text-muted-foreground">
                Define the structure and scheduling rules for{" "}
                {activeTemplate?.name ?? "this template"}.
              </p>
            </div>

            {activeTemplate && (
              <Button onClick={onLaunchClient} size="sm">
                <Rocket className="w-4 h-4 mr-2" />
                Launch Client
              </Button>
            )}
          </div>

          {!activeTemplate ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No template selected. Go back and choose a template.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Hierarchy Designer
                    </CardTitle>
                    <CardDescription>
                      Add cycles, stages, and folders. Attach scheduling rules
                      to folders.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="bg-background rounded-xl border p-4 min-h-[400px]">
                      {treeData.length > 0 ? (
                        <FolderTree
                          nodes={treeData}
                          onAdd={onAdd}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onOpenScheduler={() => setIsSchedulerOpen(true)}
                        />
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                          No folders yet. Add your first cycle or stage.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none shadow-sm bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Template Actions</CardTitle>
                    <CardDescription>
                      Manage this template and its scheduling setup.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => onAdd(activeTemplate.rootId, "cycle")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Cycle
                    </Button>

                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => onOpenSchedulerForTemplate(activeTemplate)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Configure Schedule
                    </Button>

                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={onLaunchClient}
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Launch Client
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Template Summary</CardTitle>
                    <CardDescription>
                      Quick overview of this template structure.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Template</span>
                      <span className="font-medium">{activeTemplate.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Variables</span>
                      <span className="font-medium">
                        {activeTemplate.dateVariables.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Nodes</span>
                      <span className="font-medium">{folders.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutGrid className="w-4 h-4" />
            <span>Client Workspace</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">
              {activeClient?.name ?? "No client selected"}
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight">
            Client Scheduler
          </h2>

          <p className="text-muted-foreground">
            Track scheduled folders, deadlines, and completion progress.
          </p>
        </div>

        {!activeClient || !activeTemplate ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Select a client to view the scheduler.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ClientScheduler
            folders={folders}
            variables={activeTemplate.dateVariables}
            client={activeClient}
            onToggleComplete={onToggleFolderComplete}
          />
        )}
      </div>
    </div>
  );
}
