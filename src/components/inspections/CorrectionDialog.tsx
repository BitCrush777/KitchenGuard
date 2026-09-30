"use client";

import React from "react";
import { Correction } from "../../types/inspection";
import { X, Check, History } from "lucide-react";

interface CorrectionDialogProps {
  correction: Correction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (corrId: string, accepted: boolean) => void;
}

export function CorrectionDialog({
  correction,
  isOpen,
  onClose,
  onConfirm,
}: CorrectionDialogProps) {
  if (!isOpen || !correction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1b1c1a]/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 z-10 border border-surface-container-high">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-secondary">
            <History className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Voice Correction Review
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-on-surface">
            {correction.itemName}
          </h3>
          <p className="text-sm text-secondary mt-1">
            Reason: {correction.reason}
          </p>
        </div>

        {/* Comparison card */}
        <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-5 rounded-xl border border-surface-container-high/60">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              Previous Spoken
            </span>
            <span className="text-3xl font-bold text-secondary line-through mt-1">
              {correction.previousValue}
            </span>
            <span className="text-xs text-secondary mt-0.5">Initial value</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#c07a1d] uppercase tracking-wider">
              Corrected Reading
            </span>
            <span className="text-3xl font-bold text-on-surface mt-1">
              {correction.newValue}
            </span>
            <span className="text-xs text-on-surface-variant mt-0.5">Re-stated by worker</span>
          </div>
        </div>

        <p className="text-xs text-secondary leading-relaxed">
          Accepting this reading will update the station log and evaluate related HACCP thresholds.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-container">
          <button
            onClick={() => onConfirm(correction.id, false)}
            className="py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
          >
            Keep {correction.previousValue}
          </button>
          <button
            onClick={() => onConfirm(correction.id, true)}
            className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Confirm {correction.newValue}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
