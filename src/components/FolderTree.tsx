import * as React from 'react';
import { FolderNode, FolderType } from '../types';
import { FolderItem } from './FolderItem';
import { motion, AnimatePresence } from 'motion/react';

interface FolderTreeProps {
  nodes: FolderNode[];
  level?: number;
  onAdd: (parentId: string, type: FolderType) => void;
  onEdit: (node: FolderNode) => void;
  onDelete: (nodeId: string) => void;
  onOpenScheduler: () => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  nodes,
  level = 0,
  onAdd,
  onEdit,
  onDelete,
  onOpenScheduler,
}) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({});

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {nodes.map((node) => (
        <div key={node.id} className="flex flex-col">
          <FolderItem
            node={node}
            level={level}
            isExpanded={!!expandedNodes[node.id]}
            onToggle={() => toggleNode(node.id)}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenScheduler={onOpenScheduler}
          />
          
          <AnimatePresence>
            {expandedNodes[node.id] && node.children && node.children.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <FolderTree
                  nodes={node.children}
                  level={level + 1}
                  onAdd={onAdd}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onOpenScheduler={onOpenScheduler}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
