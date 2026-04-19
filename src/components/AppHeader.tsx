import { FolderTree as TreeIcon, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientInstance } from "../types";

type AppToolbarProps = {
  viewMode: "admin" | "client";
  setViewMode: (value: "admin" | "client") => void;
  setAdminView: (value: "list" | "detail") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  clients: ClientInstance[];
  activeClientId: string | null;
  setActiveClientId: (value: string) => void;
};

export function AppToolbar({
  viewMode,
  setViewMode,
  setAdminView,
  theme,
  toggleTheme,
  clients,
  activeClientId,
  setActiveClientId,
}: AppToolbarProps) {
  if (viewMode === "admin") return null;

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <TreeIcon className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight hidden sm:block">
            DocuStruct
          </h1>
        </div>

        <Tabs
          value={viewMode}
          onValueChange={(v) => {
            const next = v as "admin" | "client";
            setViewMode(next);
            if (next === "admin") setAdminView("list");
          }}
          className="w-auto"
        >
          <TabsList className="h-9">
            <TabsTrigger value="admin" className="text-xs">
              Admin
            </TabsTrigger>
            <TabsTrigger value="client" className="text-xs">
              Client
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg"
        >
          {theme === "light" ? (
            <Moon className="w-[1.2rem] h-[1.2rem]" />
          ) : (
            <Sun className="w-[1.2rem] h-[1.2rem]" />
          )}
        </Button>

        <Select value={activeClientId || ""} onValueChange={setActiveClientId}>
          <SelectTrigger className="w-[180px] h-9 bg-muted/50 border-none">
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
