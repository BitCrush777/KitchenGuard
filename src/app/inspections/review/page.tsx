"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopNavigation } from "../../../components/layout/TopNavigation";
import { Footer } from "../../../components/layout/Footer";
import { InspectionReview } from "../../../components/inspections/InspectionReview";
import { CompletionSummary } from "../../../components/inspections/CompletionSummary";
import { initialCheckpoints, initialIssues } from "../../../services/inspectionData";
import { Inspection } from "../../../types/inspection";
import { ShieldAlert } from "lucide-react";

function InspectionReviewContent() {
  const searchParams = useSearchParams();
  const initialCompleted = searchParams?.get("status") === "completed";
  const [isFinalized, setIsFinalized] = useState(initialCompleted);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [blockerMessage, setBlockerMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paramId = searchParams?.get("id");

  useEffect(() => {
    async function loadData() {
      try {
        if (paramId) {
          const singleRes = await fetch(`/api/inspections/${paramId}`);
          if (singleRes.ok) {
            const singleData = await singleRes.json();
            if (singleData && singleData.id) {
              setInspection(singleData);
              if (singleData.status === "completed") {
                setIsFinalized(true);
              }
              return;
            }
          }
        }

        const res = await fetch("/api/inspections");
        if (res.ok) {
          const data = await res.json();
          if (data.inspections && data.inspections.length > 0) {
            setInspection(data.inspections[0]);
            if (data.inspections[0].status === "completed") {
              setIsFinalized(true);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load review inspection data:", err);
      }
    }
    loadData();
  }, [paramId]);

  const handleFinalize = async (force = false) => {
    setIsSubmitting(true);
    setBlockerMessage(null);
    try {
      const activeId = inspection?.id || "KG-2026-0928-0042";
      const res = await fetch(`/api/inspections/${activeId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectorSignoff: inspection?.inspector || "Arun Patel",
          force: force ? "true" : "false",
        }),
      });

      const result = await res.json();
      if (!result.success) {
        setBlockerMessage(result.error || result.voiceResponse || "Safety gate prevented completion.");
      } else {
        setIsFinalized(true);
        if (result.data) {
          setInspection(result.data);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to communicate with finalization safety gate.";
      setBlockerMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCheckpoints = inspection?.checkpoints || initialCheckpoints;
  const activeIssues = inspection?.issues || initialIssues;

  const verifiedCount = activeCheckpoints.filter((c) => c.status === "verified" || c.status === "warning").length;
  const totalCount = activeCheckpoints.length;
  const resolvedCount = activeIssues.filter((i) => i.status === "resolved").length;
  const unresolvedCount = activeIssues.filter((i) => i.status !== "resolved").length;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <TopNavigation />

      <main className="w-full pt-24 sm:pt-28 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {blockerMessage && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Food Safety Gate Active
                  </h4>
                  <p className="text-sm font-medium text-amber-950 mt-0.5">{blockerMessage}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFinalize(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
              >
                {isSubmitting ? "Overriding..." : "Manager Sign-off Override"}
              </button>
            </div>
          )}

          {isFinalized ? (
            /* Page 5: Polished Completion Screen */
            <CompletionSummary
              inspectionId={inspection?.id || "KG-2026-0928-0042"}
              inspectorName={inspection?.inspector || "Arun Patel"}
              checksVerified={`${verifiedCount} / ${totalCount}`}
              issuesResolved={resolvedCount}
              correctionsRecorded={inspection?.correctionsCount || 1}
              unresolvedCount={unresolvedCount}
            />
          ) : (
            /* Page 4: Pre-Finalization Review Screen */
            <InspectionReview
              checkpoints={activeCheckpoints}
              issues={activeIssues}
              onFinalize={() => handleFinalize(false)}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function InspectionReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center text-secondary text-sm">
          Loading Review Workspace...
        </div>
      }
    >
      <InspectionReviewContent />
    </Suspense>
  );
}
