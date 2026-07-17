"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { GenealogyTreeNode } from "./tree-node";

const nodeTypes = { genealogy: GenealogyTreeNode };

const LEVEL_HEIGHT = 110;
const LEAF_WIDTH = 190;

/**
 * getUserTree returns a flat address[] representing a complete binary tree in
 * breadth-first (heap) order: index 0 is the root, and the two children of
 * node i live at 2i+1 and 2i+2. This mirrors the direct/referral binary
 * placement used across begin()/chargeAccount().
 */
function buildTree(addresses: string[]): { nodes: Node[]; edges: Edge[] } {
  const depthOf = (i: number) => Math.floor(Math.log2(i + 1));
  const maxDepth = addresses.length > 0 ? depthOf(addresses.length - 1) : 0;
  const totalWidth = Math.pow(2, maxDepth) * LEAF_WIDTH;

  const nodes: Node[] = addresses.map((address, i) => {
    const depth = depthOf(i);
    const firstIndexAtDepth = Math.pow(2, depth) - 1;
    const indexInLevel = i - firstIndexAtDepth;
    const segmentWidth = totalWidth / Math.pow(2, depth);
    const x = indexInLevel * segmentWidth + segmentWidth / 2 - 84;
    const y = depth * LEVEL_HEIGHT;

    return {
      id: String(i),
      type: "genealogy",
      position: { x, y },
      data: { address, isRoot: i === 0 },
      draggable: false,
    };
  });

  const edges: Edge[] = [];
  addresses.forEach((_, i) => {
    for (const child of [2 * i + 1, 2 * i + 2]) {
      if (child < addresses.length) {
        edges.push({
          id: `${i}-${child}`,
          source: String(i),
          target: String(child),
          className: "!stroke-border",
        });
      }
    }
  });

  return { nodes, edges };
}

export function TreeGraph({
  addresses,
  onNodeClick,
}: {
  addresses: string[];
  onNodeClick?: (index: number, address: string) => void;
}) {
  const { nodes, edges } = React.useMemo(() => buildTree(addresses), [addresses]);

  const handleNodeClick: NodeMouseHandler = (_, node) => {
    const index = Number(node.id);
    onNodeClick?.(index, addresses[index]);
  };

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        elementsSelectable={false}
        onNodeClick={onNodeClick ? handleNodeClick : undefined}
      >
        <Background gap={24} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable className="!bg-card" />
      </ReactFlow>
    </div>
  );
}
