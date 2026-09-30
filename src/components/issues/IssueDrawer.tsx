"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Issue } from "../../types/inspection";
import { StatusBadge } from "../ui/StatusBadge";
import {
  X,
  MapPin,
  User,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

interface IssueDrawerProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve?: (id: string) => void;
}

export function IssueDrawer({
  issue,
  isOpen,
  onClose,
  onResolve,
}: IssueDrawerProps) {
  const isResolved = issue?.status === "resolved";

  return (
    <AnimatePresence>
      {isOpen && issue && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 bg-[#1b1c1a]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer panel with spring slide-in */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed inset-y-0 right-0 max-w-full flex pl-10"
          >
            <div className="w-screen max-w-md bg-surface-container-lowest shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              {/* Header */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
                    Issue Detail · {issue.category}
                  </span>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                    aria-label="Close panel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <StatusBadge status={issue.severity} label={`${issue.severity} Priority`} />
                    <StatusBadge status={issue.status} />
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface tracking-tight">
                    {issue.title}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-xs text-secondary">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {issue.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Logged by {issue.loggedBy}
                    </span>
                  </div>
                </div>

                {/* WHAT WAS OBSERVED */}
                <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container-high/60">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1">
                    WHAT WAS OBSERVED
                  </span>
                  <p className="text-sm font-medium text-on-surface italic">
                    &ldquo;{issue.observedText || issue.description}&rdquo;
                  </p>
                </div>

                {/* WHY IT WAS FLAGGED */}
                <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container-high/60">
                  <div className="flex items-center gap-1.5 text-secondary text-[11px] font-bold uppercase tracking-wider mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#c07a1d]" />
                    <span>WHY IT WAS FLAGGED</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {issue.flagReason ||
                      "KitchenGuard detected a food-separation issue based on the configured inspection rule."}
                  </p>
                </div>

                {/* RECOMMENDED ACTION */}
                <div className="bg-[#fef3e2]/60 rounded-xl p-4 border border-[#c07a1d]/30">
                  <span className="text-[11px] font-bold text-[#673d00] uppercase tracking-wider block mb-1">
                    CORRECTIVE ACTION
                  </span>
                  <p className="text-sm font-semibold text-on-surface">
                    {issue.recommendedAction || "Separate raw and ready-to-eat food."}
                  </p>
                </div>

                {/* History timeline */}
                <div>
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-3">
                    AUDIT TRAIL
                  </span>
                  <div className="space-y-3 pl-2 border-l-2 border-surface-container-high">
                    {issue.history?.map((step, idx) => (
                      <div key={idx} className="relative pl-4">
                        <span className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                        <span className="text-xs font-bold text-secondary block">{step.time}</span>
                        <span className="text-xs text-on-surface">{step.action}</span>
                      </div>
                    )) || (
                      <div className="text-xs text-secondary">
                        <span>{issue.createdAt} · Observation recorded via voice</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-6 mt-6 border-t border-surface-container flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
                {!isResolved && onResolve && (
                  <button
                    onClick={() => onResolve(issue.id)}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
