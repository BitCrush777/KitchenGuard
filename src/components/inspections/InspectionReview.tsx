"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Checkpoint, Issue } from "../../types/inspection";
import { StatusBadge } from "../ui/StatusBadge";
import { NumberTicker } from "../magic/NumberTicker";
import {
  ArrowLeft,
  ShieldCheck,
  Thermometer,
  Layers,
  Sparkles,
  Archive,
  Trash2,
  Tag,
  Check,
} from "lucide-react";

interface InspectionReviewProps {
  checkpoints: Checkpoint[];
  issues: Issue[];
  onFinalize: () => void;
  className?: string;
}

export function InspectionReview({
  checkpoints,
  issues,
  onFinalize,
  className = "",
}: InspectionReviewProps) {
  const completedChecks = checkpoints.filter(
    (c) => c.status === "verified" || c.status === "warning"
  ).length;
  const issuesDetected = issues.length;
  const issuesResolved = issues.filter((i) => i.status === "resolved").length;
  const unresolved = issuesDetected - issuesResolved;

  // Group checkpoints by category
  const categories = [
    { key: "temperature", label: "Temperature Control", icon: Thermometer },
    { key: "storage", label: "Storage & Separation", icon: Layers },
    { key: "hygiene", label: "Hand Hygiene & Supplies", icon: Sparkles },
    { key: "cleaning", label: "Sanitation & Chemical Titration", icon: Archive },
    { key: "labels", label: "Labeling & FIFO Rotation", icon: Tag },
    { key: "waste", label: "Waste Disposal & Grounds", icon: Trash2 },
  ];

  return (
    <div className={`w-full max-w-5xl mx-auto flex flex-col gap-8 pb-16 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/inspections/live"
            className="inline-flex items-center gap-1.5 text-secondary hover:text-primary transition-colors text-xs font-semibold mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Inspection</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
            Review before you finish.
          </h1>
          <p className="text-sm sm:text-base text-secondary mt-1">
            Verify recorded observations and safety flags before generating the final compliance report.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/inspections/live"
            className="px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-colors"
          >
            Return to Inspection
          </Link>
          <motion.button
            type="button"
            onClick={onFinalize}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Finalize Inspection</span>
          </motion.button>
        </div>
      </div>

      {/* Metric Mosaic Banner with NumberTicker */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-high/60">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container-high/40">
            <span className="text-xs text-secondary font-medium">Checks Complete</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-primary">
                <NumberTicker value={completedChecks} delay={0.1} />
              </span>
              <span className="text-xs text-secondary">/ {checkpoints.length}</span>
            </div>
            <span className="text-[11px] text-primary font-semibold mt-0.5">100% evaluated</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container-high/40">
            <span className="text-xs text-secondary font-medium">Issues Detected</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-[#c07a1d]">
                <NumberTicker value={issuesDetected} delay={0.18} />
              </span>
              <span className="text-xs text-secondary">flagged</span>
            </div>
            <span className="text-[11px] text-secondary mt-0.5">Intercepted</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container-high/40">
            <span className="text-xs text-secondary font-medium">Resolved</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-primary">
                <NumberTicker value={issuesResolved} delay={0.26} />
              </span>
              <span className="text-xs text-secondary">verified</span>
            </div>
            <span className="text-[11px] text-primary font-semibold mt-0.5">Remediated in-pass</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container-high/40">
            <span className="text-xs text-secondary font-medium">Voice Corrections</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-on-surface">1</span>
              <span className="text-xs text-secondary">recorded</span>
            </div>
            <span className="text-[11px] text-secondary mt-0.5">4°C → 6°C confirmed</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col justify-between border border-surface-container-high/40 col-span-2 sm:col-span-1">
            <span className="text-xs text-secondary font-medium">Unresolved</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-primary">
                <NumberTicker value={unresolved} delay={0.34} />
              </span>
              <span className="text-xs text-secondary">open</span>
            </div>
            <span className="text-[11px] text-primary font-semibold mt-0.5">Ready for sign-off</span>
          </div>
        </div>
      </section>

      {/* Structured Category Breakdown */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-on-surface tracking-tight">
          Operational Checks by Station
        </h2>

        <div className="space-y-4">
          {categories.map((cat) => {
            const catChecks = checkpoints.filter((c) => c.category === cat.key);
            if (catChecks.length === 0) return null;
            const Icon = cat.icon;

            return (
              <div
                key={cat.key}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col gap-4"
              >
                <div className="flex items-center gap-2.5 pb-2 border-b border-surface-container">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">{cat.label}</h3>
                </div>

                <div className="space-y-3">
                  {catChecks.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-surface-container-high/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-on-surface">
                            {chk.name}
                          </span>
                          <StatusBadge status={chk.status} size="sm" />
                        </div>
                        <p className="text-xs text-secondary mt-1">{chk.description}</p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {chk.currentValue && (
                          <div className="text-right">
                            <span className="text-base font-bold text-on-surface">
                              {chk.currentValue}
                            </span>
                            {chk.target && (
                              <span className="block text-[11px] text-secondary">
                                Target: {chk.target}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-secondary">
                          {chk.notes || "Verified"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 w-full bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-surface-container-high flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-secondary">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>HACCP Validation Engine: All mandatory parameters satisfied</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/inspections/live"
            className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
          >
            Return to Inspection
          </Link>
          <button
            type="button"
            onClick={onFinalize}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-md cursor-pointer"
          >
            Finalize Inspection
          </button>
        </div>
      </div>
    </div>
  );
}
