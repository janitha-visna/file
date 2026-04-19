// TemplateListView.tsx
import * as React from "react";
import {
  Plus,
  LayoutGrid,
  MoreVertical,
  Pencil,
  CalendarClock,
  Trash2,
  Clock,
  FolderTree as TreeIcon,
  Moon,
  Sun,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Template,FolderNode } from "../types";

type Props = {
  templates: Template[];
  folders: FolderNode[];
  theme: "light" | "dark";
  toggleTheme: () => void;
  onCreateTemplate: () => void;
  onOpenTemplate: (templateId: string) => void;
  onRenameTemplate: (template: Template) => void;
  onOpenScheduler: (template: Template) => void;
  onDeleteTemplate: (rootId: string) => void;
};

export function TemplateListView({
  templates,
  folders,
  theme,
  toggleTheme,
  onCreateTemplate,
  onOpenTemplate,
  onRenameTemplate,
  onOpenScheduler,
  onDeleteTemplate,
}: Props) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground">
            Select a template to design its structure.
          </p>
        </div>

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

          <Button onClick={onCreateTemplate} className="gap-2">
            <Plus className="w-4 h-4" />
            New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
            onClick={() => onOpenTemplate(template.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <LayoutGrid className="w-5 h-5" />
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      )}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onRenameTemplate(template)}
                        className="gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Rename
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onOpenScheduler(template)}
                        className="gap-2"
                      >
                        <CalendarClock className="w-4 h-4" />
                        Date Scheduler
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => onDeleteTemplate(template.rootId)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardTitle className="mt-4">{template.name}</CardTitle>
              <CardDescription>
                {folders.filter((f) => f.parentId === template.rootId).length}{" "}
                cycles defined
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last updated 2 days ago
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full py-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <TreeIcon className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">No templates found</h3>
              <p className="text-sm text-muted-foreground">
                Create your first template to start designing structures.
              </p>
            </div>

            <Button variant="outline" onClick={onCreateTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
