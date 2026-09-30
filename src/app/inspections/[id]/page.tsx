"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopNavigation } from "../../../components/layout/TopNavigation";
import { Footer } from "../../../components/layout/Footer";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { CheckpointList } from "../../../components/inspections/CheckpointList";
import {
  sampleInspectionRecord,
  sampleInspectionHistory,
} from "../../../services/inspectionData";
import { Inspection } from "../../../types/inspection";
import {
  ArrowLeft,
  FileText,
  Clock,
  User,
} from "lucide-react";

export default function InspectionDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "KG-2026-0928-0042";

  const [inspection, setInspection] = React.useState<Inspection>(() => {
    return sampleInspectionHistory.find((i) => i.id === id) || sampleInspectionRecord;
  });

  React.useEffect(() => {
    async function loadInspection() {
      try {
        const res = await fetch(`/api/inspections/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.inspection) {
            setInspection(json.inspection);
          }
        }
      } catch (err) {
        console.warn("Failed to load inspection by ID:", err);
      }
    }
    loadInspection();
  }, [id]);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <TopNavigation />

      <main className="w-full pt-24 sm:pt-28 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-8 pb-12">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <Link
                href="/inspections"
                className="inline-flex items-center gap-1.5 text-secondary hover:text-primary transition-colors text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Inspections</span>
              </Link>

              <div className="flex items-center gap-3">
                <Link
                  href="/reports"
                  className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Full Report</span>
                </Link>
              </div>
            </div>

            {/* Header Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-secondary">
                    {inspection.id}
                  </span>
                  <StatusBadge status={inspection.status} size="sm" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                  {inspection.typeName}
                </h1>
                <p className="text-sm text-secondary mt-1">
                  Location: <strong className="text-on-surface">{inspection.kitchen}</strong> · Shift: Morning Prep Line
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-secondary">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Inspector: {inspection.inspector}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Duration: {inspection.durationMinutes} mins
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center bg-surface-container-low p-5 rounded-xl border border-surface-container-high/50 self-start sm:self-center">
                <span className="text-[11px] text-secondary font-bold uppercase tracking-wider">
                  Readiness Score
                </span>
                <span className="text-3xl font-bold text-primary mt-1">
                  {inspection.readinessScore}%
                </span>
                <span className="text-xs text-secondary mt-0.5">HACCP Tier 1 Pass</span>
              </div>
            </div>

            {/* Checkpoints Section */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Verified Checkpoints</h2>
                  <p className="text-xs text-secondary">
                    {inspection.checkpointsCompleted} of {inspection.checkpointsTotal} items verified
                  </p>
                </div>
                <span className="text-xs text-primary font-semibold">100% Pass</span>
              </div>

              <CheckpointList checkpoints={inspection.checkpoints} />
            </div>

            {/* Issues Logged */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <h2 className="text-lg font-bold text-on-surface">Issues Identified</h2>
                <span className="text-xs text-secondary">
                  {inspection.issuesCount} logged ({inspection.issuesResolved} resolved)
                </span>
              </div>

              {inspection.issues.length === 0 ? (
                <div className="py-6 text-center text-xs text-secondary">
                  No issues flagged during this inspection walkthrough.
                </div>
              ) : (
                <div className="space-y-3">
                  {inspection.issues.map((iss) => (
                    <div
                      key={iss.id}
                      className="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-surface-container-high/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-on-surface">
                            {iss.title}
                          </span>
                          <StatusBadge status={iss.status} size="sm" />
                        </div>
                        <p className="text-xs text-secondary mt-1">{iss.description}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-secondary self-start sm:self-center">
                        {iss.location}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
