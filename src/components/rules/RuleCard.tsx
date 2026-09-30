"use client";

import React, { useState } from "react";
import { InspectionRule } from "../../types/inspection";
import { Edit3, Check } from "lucide-react";

interface RuleCardProps {
  rule: InspectionRule;
  onUpdateRule?: (updated: InspectionRule) => void;
  className?: string;
}

export function RuleCard({
  rule,
  onUpdateRule,
  className = "",
}: RuleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [threshold, setThreshold] = useState(rule.targetThreshold);
  const [action, setAction] = useState(rule.action);
  const [enabled, setEnabled] = useState(rule.enabled);

  const handleSave = () => {
    onUpdateRule?.({
      ...rule,
      targetThreshold: threshold,
      action,
      enabled,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setThreshold(rule.targetThreshold);
    setAction(rule.action);
    setEnabled(rule.enabled);
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col justify-between gap-4 transition-all hover:shadow-md ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider bg-surface-container-low px-2 py-0.5 rounded border border-surface-container-high/50">
              {rule.category}
            </span>
            <span className="text-xs text-outline">·</span>
            <span className="text-xs text-secondary font-mono">{rule.standard}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                enabled ? "bg-primary" : "bg-surface-container-highest"
              }`}
              role="switch"
              aria-checked={enabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                aria-label="Edit rule"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-on-surface tracking-tight">
            {rule.name}
          </h3>
          <p className="text-xs text-secondary mt-1 leading-relaxed">
            {rule.description}
          </p>
        </div>

        {isEditing ? (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1">
                Configured Limit / Requirement
              </label>
              <input
                type="text"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1">
                Trigger Action
              </label>
              <input
                type="text"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                Target Threshold
              </span>
              <span className="text-sm font-bold text-on-surface mt-0.5 block">
                {threshold}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                Action On Drift
              </span>
              <span className="text-xs font-medium text-on-surface mt-0.5 block truncate" title={action}>
                {action}
              </span>
            </div>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container shadow-sm flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Rule</span>
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-surface-container-high/40 flex items-center justify-between text-xs text-secondary">
          <span>Configurable operational policy</span>
          <span
            className={`font-semibold ${
              enabled ? "text-primary" : "text-outline"
            }`}
          >
            {enabled ? "Active in voice engine" : "Disabled"}
          </span>
        </div>
      )}
    </div>
  );
}
