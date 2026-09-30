import React from "react";
import { Check, AlertTriangle, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export type BadgeVariant =
  | "verified"
  | "attention"
  | "critical"
  | "pending"
  | "open"
  | "resolved"
  | "completed";

interface StatusBadgeProps {
  status: BadgeVariant | string;
  label?: string;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className = "",
  size = "md",
}: StatusBadgeProps) {
  const normStatus = status.toLowerCase() as BadgeVariant;

  const config = {
    verified: {
      bg: "bg-[#e8f5e9] text-[#2e7d32]",
      label: "Verified",
      icon: Check,
    },
    completed: {
      bg: "bg-primary-fixed text-on-primary-fixed",
      label: "Completed",
      icon: CheckCircle2,
    },
    resolved: {
      bg: "bg-primary-fixed text-on-primary-fixed",
      label: "Resolved",
      icon: Check,
    },
    attention: {
      bg: "bg-[#fef3e2] text-[#c07a1d]",
      label: "Attention",
      icon: AlertTriangle,
    },
    warning: {
      bg: "bg-[#fef3e2] text-[#c07a1d]",
      label: "Needs Attention",
      icon: AlertTriangle,
    },
    critical: {
      bg: "bg-error-container text-on-error-container",
      label: "Critical",
      icon: AlertCircle,
    },
    open: {
      bg: "bg-surface-container-high text-secondary",
      label: "Open",
      icon: Clock,
    },
    pending: {
      bg: "bg-surface-container text-secondary",
      label: "Pending",
      icon: Clock,
    },
  }[normStatus] || {
    bg: "bg-surface-container text-secondary",
    label: status,
    icon: Clock,
  };

  const IconComp = config.icon;
  const displayText = label || config.label;
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bg} ${padding} ${className}`}
    >
      {showIcon && <IconComp className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      <span>{displayText}</span>
    </span>
  );
}
