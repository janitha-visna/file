import { FolderNode } from "@/src/types";
import { Template } from "@/src/types";
import { ClientInstance } from "@/src/types";

export const INITIAL_FOLDERS: FolderNode[] = [
  { id: "t1", name: "ISO 9001:2015", type: "template", parentId: null },
  { id: "c1", name: "Cycle 1", type: "cycle", parentId: "t1" },
  { id: "s1", name: "Application", type: "stage", parentId: "c1" },
  {
    id: "f1",
    name: "Forms",
    type: "folder",
    parentId: "s1",
    schedulingRule: {
      variableId: "v1",
      offsetValue: 7,
      offsetUnit: "days",
      type: "before",
    },
  },
];


export const INITIAL_TEMPLATES: Template[] = [
  {
    id: "temp1",
    name: "ISO 9001:2015",
    rootId: "t1",
    dateVariables: [
      { id: "v1", name: "Stage 1 Audit Date" },
      { id: "v2", name: "Stage 2 Audit Date" },
    ],
  },
];

export const INITIAL_CLIENTS: ClientInstance[] = [
  {
    id: "client1",
    name: "Acme Corp",
    templateId: "temp1",
    variableValues: {
      v1: "2026-04-20",
      v2: "2026-05-15",
    },
    folderStates: {
      f1: { isCompleted: true, completedAt: "2026-04-10" },
    },
  },
];