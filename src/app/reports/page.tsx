"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopNavigation } from "../../components/layout/TopNavigation";
import { Footer } from "../../components/layout/Footer";
import { InspectionReportView } from "../../components/reports/InspectionReportView";
import { sampleInspectionRecord } from "../../services/inspectionData";
import { Inspection } from "../../types/inspection";

function ReportsContent() {
  const searchParams = useSearchParams();
  const requestedId = searchParams?.get("id");
  const [inspection, setInspection] = useState<Inspection>(sampleInspectionRecord);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch("/api/inspections");
        if (res.ok) {
          const json = await res.json();
          if (json.inspections && json.inspections.length > 0) {
            if (requestedId) {
              const matched = json.inspections.find((i: Inspection) => i.id === requestedId);
              if (matched) {
                setInspection(matched);
                return;
              }
            }
            // Default to most recently completed or active inspection
            const completed = json.inspections.find((i: Inspection) => i.status === "completed");
            setInspection(completed || json.inspections[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to load report from API, displaying sample:", err);
      }
    }
    loadReport();
  }, [requestedId]);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <TopNavigation />

      <main className="w-full pt-24 sm:pt-28 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <InspectionReportView inspection={inspection} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center text-secondary text-sm">
          Loading Official Audit Report...
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
