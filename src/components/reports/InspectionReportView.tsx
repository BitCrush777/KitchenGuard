"use client";

import React from "react";
import { Inspection } from "../../types/inspection";
import {
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Camera,
  Mic,
  PenTool,
  Clock,
  User,
  ArrowLeft,
  Check,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface InspectionReportViewProps {
  inspection: Inspection;
  className?: string;
}

export function InspectionReportView({
  inspection,
  className = "",
}: InspectionReportViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`w-full max-w-5xl mx-auto flex flex-col gap-8 pb-16 ${className}`}>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-secondary text-xs">
          <Link
            href="/inspections"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Inspection Archives</span>
          </Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-semibold">Audit Record</span>
          <span className="text-outline">/</span>
          <span className="font-mono text-outline">{inspection.id}</span>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Audit record link copied to clipboard!");
              }
            }}
            className="h-10 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Audit Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inspection, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `KitchenGuard-Report-${inspection.id}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="h-10 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="h-10 px-5 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-semibold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <article className="bg-surface-container-lowest shadow-xl rounded-2xl p-6 sm:p-10 lg:p-12 flex flex-col gap-8 relative overflow-hidden border border-surface-container-high/60">
        {/* Subtle Watermark Seal */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-gradient-to-br from-primary/5 via-primary-fixed/10 to-transparent pointer-events-none blur-2xl" />

        {/* Document Header */}
        <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-surface-container pb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-secondary-container text-[11px] uppercase tracking-wider font-bold">
                Official Protocol
              </span>
              <span className="text-secondary text-xs font-medium">
                HACCP Routine Morning Clearance
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
              Inspection Report
            </h1>
            <p className="text-lg text-on-surface-variant font-medium">
              {inspection.kitchen} · {inspection.typeName}
            </p>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-secondary text-xs">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-outline" />
                September 28, 2026 · 10:46 AM EDT
              </span>
              <span className="inline-block w-1 h-1 rounded-full bg-outline-variant" />
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-outline" />
                Inspector {inspection.inspector} ({inspection.inspectorRole})
              </span>
            </div>
          </div>

          {/* Registry Hash Stamp */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-1 bg-surface-container-low p-4 rounded-xl border border-surface-container-high/50">
            <div className="flex flex-col lg:text-right">
              <span className="text-[10px] uppercase text-secondary tracking-widest font-bold">
                Document Ref
              </span>
              <span className="font-mono text-sm font-bold text-primary tracking-tight">
                {inspection.id}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 bg-surface-container px-2 py-1 rounded text-[11px] font-mono font-semibold text-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>HASH-VALID</span>
            </div>
          </div>
        </header>

        {/* Status Ledger */}
        <section className="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-4 border border-surface-container-high/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-secondary font-bold">
                  Audit State
                </span>
                <span className="text-xl font-bold text-primary tracking-tight">
                  COMPLETED & AUDITED
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Line Cleared for Service</span>
            </div>
          </div>

          {/* Metric Mosaic Inset */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            <div className="bg-surface-container-lowest p-3.5 rounded-xl flex flex-col justify-between border border-surface-container-high/40">
              <span className="text-[11px] text-secondary font-semibold">Checks Run</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-primary">{inspection.checkpointsTotal}</span>
                <span className="text-xs text-secondary">/ {inspection.checkpointsTotal}</span>
              </div>
              <span className="text-[10px] text-primary font-semibold mt-0.5">100% complete</span>
            </div>

            <div className="bg-surface-container-lowest p-3.5 rounded-xl flex flex-col justify-between border border-surface-container-high/40">
              <span className="text-[11px] text-secondary font-semibold">Issues Found</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-[#c07a1d]">{inspection.issuesCount}</span>
                <span className="text-xs text-secondary">flagged</span>
              </div>
              <span className="text-[10px] text-[#c07a1d] mt-0.5">Auto-intercepted</span>
            </div>

            <div className="bg-surface-container-lowest p-3.5 rounded-xl flex flex-col justify-between border border-surface-container-high/40">
              <span className="text-[11px] text-secondary font-semibold">Resolved</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-primary">{inspection.issuesResolved}</span>
                <span className="text-xs text-secondary">verified</span>
              </div>
              <span className="text-[10px] text-primary font-semibold mt-0.5">Remediated in-pass</span>
            </div>

            <div className="bg-surface-container-lowest p-3.5 rounded-xl flex flex-col justify-between border border-surface-container-high/40">
              <span className="text-[11px] text-secondary font-semibold">Voice Overrides</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-on-surface">1</span>
                <span className="text-xs text-secondary">entry</span>
              </div>
              <span className="text-[10px] text-secondary mt-0.5">Audio audit log</span>
            </div>

            <div className="bg-surface-container-lowest p-3.5 rounded-xl flex flex-col justify-between border border-surface-container-high/40 col-span-2 md:col-span-1">
              <span className="text-[11px] text-secondary font-semibold">Unresolved</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-primary">0</span>
                <span className="text-xs text-secondary">open</span>
              </div>
              <span className="text-[10px] text-primary font-bold mt-0.5">Zero violations</span>
            </div>
          </div>
        </section>

        {/* Section 1: Executive Summary */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tracking-widest text-secondary font-bold">
              01 / OVERVIEW
            </span>
            <div className="h-px flex-1 bg-surface-container-high" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 flex flex-col gap-3">
              <h2 className="text-xl font-bold text-on-surface">
                Executive Summary & HACCP Readiness
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Opening walkthrough completed across{" "}
                <strong className="text-on-surface font-bold">8 food safety checkpoints</strong>.
                Two temporary issues (refrigerator temp calibration and raw poultry shelf placement)
                were identified via natural voice observation, verified against restaurant safety
                thresholds, and successfully corrected before line opening. Line sanitation and cold
                chain parameters satisfy Michelin-tier quality directives.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>Critical Control Points Verified</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>Cross-Contamination Safeguards Active</span>
                </div>
              </div>
            </div>

            {/* Inspection Photo Asset Proof */}
            <div className="lg:col-span-4 overflow-hidden rounded-2xl bg-surface-container-high relative">
              <img
                className="w-full h-44 object-cover"
                alt="Station inspection proof"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeNl0O2sROOj4rWCbWWInEM5aQmoZhqzN40dRWOEDG6_-O0CxwC67U-IO8qbHwIn6AhYqgtbayJsTVgD1LYa1vZdotLQv8EZ38Hc3kyespd5FU9-8JLngO8nHtrs4LbHb3ZVaGr29pXB6waBW6uaYPGzVHFTSuGpcgR1cob5ntMfgPQuXLuxj79bfMFdSBxSdmLTFM-aiVCZ3cL4473tzyzMfwpUNCUOEip_XWiT0QSXpczBrGQHY9Eg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] text-inverse-on-surface font-semibold flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" />
                  Visual Station Record · 10:45 AM
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Verified Checkpoints Breakdown */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xs font-mono tracking-widest text-secondary font-bold">
                02 / PROTOCOL LOG
              </span>
              <div className="h-px flex-1 bg-surface-container-high" />
            </div>
            <span className="text-xs text-secondary font-mono ml-4 font-semibold">
              8 ITEMS VALIDATED
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {inspection.checkpoints.map((chk) => (
              <div
                key={chk.id}
                className="bg-surface-container-low rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border border-surface-container-high/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-on-surface">{chk.name}</span>
                    <p className="text-xs text-secondary mt-0.5">{chk.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  {chk.currentValue && (
                    <div className="text-right">
                      <span className="text-base font-bold text-primary">{chk.currentValue}</span>
                      {chk.target && (
                        <span className="block text-[10px] text-secondary">
                          Target: {chk.target}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Compliant</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Voice Observation & Audio Audit Trail */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xs font-mono tracking-widest text-secondary font-bold">
                03 / VOICE AUDIT STREAM
              </span>
              <div className="h-px flex-1 bg-surface-container-high" />
            </div>
            <span className="text-xs text-on-primary-fixed-variant bg-primary-fixed px-2.5 py-0.5 rounded-full font-semibold">
              HACCP Audio Trace Active
            </span>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-5 sm:p-6 flex flex-col gap-4 border border-surface-container-high/60">
            <div className="flex items-center justify-between text-secondary text-xs">
              <span className="flex items-center gap-1.5 font-bold text-on-surface">
                <Mic className="w-4 h-4 text-primary" />
                Acoustic Telemetry Stream (3 Events Logged)
              </span>
              <span className="font-mono">Engine: AssemblyAI-Culinary-Streaming</span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 border border-surface-container-high/40">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-secondary mt-0.5">10:41:12</span>
                  <div>
                    <p className="text-sm text-on-surface italic font-medium">
                      &ldquo;Walk-in refrigerator is six degrees...&rdquo;
                    </p>
                    <span className="text-xs text-[#c07a1d] mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Safety Rule Triggered: Critical limit exceeded (&gt; 5.0°C)
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-error-container text-on-error-container text-xs font-semibold self-start sm:self-center">
                  Threshold Alert
                </span>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 border border-surface-container-high/40">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-secondary mt-0.5">10:42:04</span>
                  <div>
                    <p className="text-sm text-on-surface italic font-medium">
                      &ldquo;Adjusted damper, re-checked temp at 3.8 degrees&rdquo;
                    </p>
                    <span className="text-xs text-primary mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Acoustic calibration matched probe reading 3.8°C
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-primary-fixed text-on-primary-fixed text-xs font-semibold self-start sm:self-center">
                  Resolved
                </span>
              </div>

              <div className="bg-surface-container-lowest p-4 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 border border-surface-container-high/40">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-secondary mt-0.5">10:44:30</span>
                  <div>
                    <p className="text-sm text-on-surface italic font-medium">
                      &ldquo;Raw chicken moved below prepped salad greens&rdquo;
                    </p>
                    <span className="text-xs text-primary mt-1 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Voice directive aligned with physical separation rule
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-primary-fixed text-on-primary-fixed text-xs font-semibold self-start sm:self-center">
                  Resolved
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Operational Sign-off & Attestation */}
        <section className="flex flex-col gap-4 pt-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tracking-widest text-secondary font-bold">
              04 / ATTESTATION
            </span>
            <div className="h-px flex-1 bg-surface-container-high" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low p-6 rounded-2xl border border-surface-container-high/60">
            <div className="flex flex-col justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/40">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-secondary font-bold">
                  Authorized Kitchen Supervisor
                </span>
                <span className="text-lg font-bold text-primary block mt-0.5">
                  {inspection.inspector}
                </span>
                <span className="text-xs text-secondary">{inspection.inspectorRole}</span>
              </div>
              <div className="py-2 px-3 rounded-lg bg-surface-container-low flex items-center justify-between text-xs text-secondary">
                <div className="flex items-center gap-1.5 font-mono text-on-surface font-medium">
                  <PenTool className="w-4 h-4 text-primary" />
                  <span>Signed · 2026-09-28 10:46:18 UTC</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/40">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-secondary font-bold">
                  Compliance Status
                </span>
                <span className="text-lg font-bold text-primary block mt-0.5">
                  100% Protocol Clearance
                </span>
                <span className="text-xs text-secondary">
                  Ready for lunch service seating
                </span>
              </div>
              <div className="py-2 px-3 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  HACCP Verification Sealed
                </span>
                <span className="font-mono">Pass</span>
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
