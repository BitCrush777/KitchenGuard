"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, Plus, FileText } from "lucide-react";
import { CompletionAnimation } from "../magic/CompletionAnimation";
import { NumberTicker } from "../magic/NumberTicker";

interface CompletionSummaryProps {
  inspectionId?: string;
  inspectorName?: string;
  checksVerified?: string;
  issuesResolved?: number;
  correctionsRecorded?: number;
  unresolvedCount?: number;
  className?: string;
}

export function CompletionSummary({
  inspectionId = "KG-2026-0928-0042",
  inspectorName = "Arun Patel",
  checksVerified = "8 / 8",
  issuesResolved = 2,
  correctionsRecorded = 1,
  unresolvedCount = 0,
  className = "",
}: CompletionSummaryProps) {
  return (
    <div
      className={`w-full max-w-3xl mx-auto py-12 px-6 flex flex-col items-center text-center gap-8 ${className}`}
    >
      {/* Large Restrained Success Icon with Magic UI subtle breathing halo */}
      <CompletionAnimation size={40} />

      {/* Heading & Supporting */}
      <div className="space-y-2 max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
          Inspection complete.
        </h1>
        <p className="text-base text-secondary">
          All required checks have been recorded and reviewed. Line cleared for service.
        </p>
      </div>

      {/* Metrics Ledger Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
            <span className="text-3xl font-bold text-primary block">{checksVerified}</span>
            <span className="text-xs text-secondary mt-1 block">Checks verified</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
            <span className="text-3xl font-bold text-primary block">
              <NumberTicker value={issuesResolved} delay={0.15} />
            </span>
            <span className="text-xs text-secondary mt-1 block">Issues resolved</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
            <span className="text-3xl font-bold text-on-surface block">
              <NumberTicker value={correctionsRecorded} delay={0.25} />
            </span>
            <span className="text-xs text-secondary mt-1 block">Correction recorded</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
            <span className="text-3xl font-bold text-primary block">
              <NumberTicker value={unresolvedCount} delay={0.35} />
            </span>
            <span className="text-xs text-secondary mt-1 block">Unresolved</span>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-surface-container text-xs text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider">Inspection ID:</span>
            <span className="font-mono text-on-surface font-semibold">{inspectionId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider">Inspector:</span>
            <span className="text-on-surface font-medium">{inspectorName}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons with Spring Feedback */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Link
            href={`/reports`}
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-md flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>View Report</span>
          </Link>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => window.print()}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="px-6 py-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </motion.button>

        <motion.div
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Link
            href="/inspections/new"
            className="px-6 py-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-secondary font-semibold text-sm transition-colors flex items-center gap-2 border border-surface-container-high/60"
          >
            <Plus className="w-4 h-4" />
            <span>Start another inspection</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
