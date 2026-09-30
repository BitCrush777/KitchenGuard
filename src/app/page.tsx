"use client";

import React, { useState, useEffect } from "react";
import { TopNavigation } from "../components/layout/TopNavigation";
import { Footer } from "../components/layout/Footer";
import { DashboardOverview } from "../components/dashboard/DashboardOverview";
import { InspectionTimeline } from "../components/dashboard/InspectionTimeline";
import { IssueList } from "../components/issues/IssueList";
import { initialIssues } from "../services/inspectionData";
import { Issue, Inspection } from "../types/inspection";

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [activeInspection, setActiveInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch("/api/inspections");
        if (res.ok) {
          const json = await res.json();
          if (json.inspections && json.inspections.length > 0) {
            const current = json.inspections[0];
            setActiveInspection(current);
            if (current.issues && current.issues.length > 0) {
              setIssues(current.issues);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load dashboard data from API:", err);
      }
    }
    loadDashboardData();
  }, []);

  const handleResolveIssue = async (id: string) => {
    // Optimistic UI update
    setIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, status: "resolved" } : iss))
    );

    try {
      await fetch("/api/tools/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "resolveIssue",
          parameters: {
            issueId: id,
            resolutionNotes: "Resolved by Kitchen Manager from Dashboard",
          },
        }),
      });
    } catch (err) {
      console.error("Failed to persist resolved issue:", err);
    }
  };

  const openIssuesCount = issues.filter((i) => i.status !== "resolved").length;
  const readiness = activeInspection?.readinessScore ?? 87;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <TopNavigation />

      <main className="w-full pt-24 sm:pt-28 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Main Dashboard Hero Overview */}
          <DashboardOverview
            readinessScore={readiness}
            scheduledCount={12}
            completedCount={10}
            attentionCount={openIssuesCount}
          />

          {/* Today's Inspection Timeline */}
          <InspectionTimeline />

          {/* Needs Attention Issues Section */}
          <IssueList
            issues={issues}
            title="Needs attention"
            showViewAll={true}
            onResolveIssue={handleResolveIssue}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
