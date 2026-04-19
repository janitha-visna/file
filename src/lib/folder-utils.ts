import { FolderNode } from '../types';

export const buildTree = (nodes: FolderNode[], parentId: string | null = null): FolderNode[] => {
  return nodes
    .filter((node) => node.parentId === parentId)
    .map((node) => ({
      ...node,
      children: buildTree(nodes, node.id),
    }));
};

export const getAncestors = (nodes: FolderNode[], nodeId: string): FolderNode[] => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node || !node.parentId) return [];
  const parent = nodes.find((n) => n.id === node.parentId);
  if (!parent) return [];
  return [...getAncestors(nodes, parent.id), parent];
};

export const deleteNodeRecursive = (nodes: FolderNode[], nodeId: string): FolderNode[] => {
  const children = nodes.filter((n) => n.parentId === nodeId);
  let updatedNodes = nodes.filter((n) => n.id !== nodeId);
  children.forEach((child) => {
    updatedNodes = deleteNodeRecursive(updatedNodes, child.id);
  });
  return updatedNodes;
};
