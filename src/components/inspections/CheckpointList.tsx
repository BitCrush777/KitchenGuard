import React from "react";
import { Checkpoint } from "../../types/inspection";
import { CheckpointItem } from "./CheckpointItem";

interface CheckpointListProps {
  checkpoints: Checkpoint[];
  className?: string;
  onSelectCheckpoint?: (chk: Checkpoint) => void;
}

export function CheckpointList({
  checkpoints,
  className = "",
  onSelectCheckpoint,
}: CheckpointListProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {checkpoints.map((checkpoint) => (
        <CheckpointItem
          key={checkpoint.id}
          checkpoint={checkpoint}
          onClick={() => onSelectCheckpoint?.(checkpoint)}
        />
      ))}
    </div>
  );
}
