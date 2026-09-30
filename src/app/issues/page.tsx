"use client";

import React, { useState, useEffect } from "react";
import { TopNavigation } from "../../components/layout/TopNavigation";
import { Footer } from "../../components/layout/Footer";
import { IssueList } from "../../components/issues/IssueList";
import { initialIssues } from "../../services/inspectionData";
import { Issue, Inspection } from "../../types/inspection";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  useEffect(() => {
    async function loadIssues() {
      try {
        const res = await fetch("/api/inspections");
        if (res.ok) {
          const json = await res.json();
          if (json.inspections && json.inspections.length > 0) {
            // Aggregate all issues across inspections
            const allIssuesMap = new Map<string, Issue>();
            for (const insp of json.inspections as Inspection[]) {
              if (insp.issues) {
                for (const iss of insp.issues) {
                  allIssuesMap.set(iss.id, iss);
                }
              }
            }
            if (allIssuesMap.size > 0) {
              setIssues(Array.from(allIssuesMap.values()));
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load issues from API:", err);
      }
    }
    loadIssues();
  }, []);

  const handleResolveIssue = async (id: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Optimistic UI update
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === id
          ? {
              ...iss,
              status: "resolved",
              resolvedAt: nowStr,
              resolutionNote: "Marked resolved via Issue Management Panel",
            }
          : iss
      )
    );

    try {
      await fetch("/api/tools/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "resolveIssue",
          parameters: {
            issueId: id,
            resolutionNotes: "Marked resolved via Issue Management Panel",
          },
        }),
      });
    } catch (err) {
      console.error("Failed to persist resolved issue:", err);
    }
  };

  const openIssues = issues.filter((i) => i.status !== "resolved");
  const resolvedIssues = issues.filter((i) => i.status === "resolved");

  const filteredIssues =
    filter === "all" ? issues : filter === "open" ? openIssues : resolvedIssues;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <TopNavigation />

      <main className="w-full pt-24 sm:pt-28 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Correction Management
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
                Issues
              </h1>
              <p className="text-sm sm:text-base text-secondary mt-1">
                Manage operational drift, cross-contamination flags, and station resolutions.
              </p>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-surface-container-high/60 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === "all"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                All ({issues.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("open")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === "open"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                Open ({openIssues.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("resolved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === "resolved"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                Resolved ({resolvedIssues.length})
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider">
                  Open Flags
                </span>
                <div className="text-3xl font-bold text-[#c07a1d] mt-1">
                  {openIssues.length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#c07a1d]">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider">
                  Resolved
                </span>
                <div className="text-3xl font-bold text-primary mt-1">
                  {resolvedIssues.length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider">
                  Resolution Rate
                </span>
                <div className="text-3xl font-bold text-on-surface mt-1">
                  {issues.length > 0 ? Math.round((resolvedIssues.length / issues.length) * 100) : 100}%
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Issue Cards */}
          <IssueList
            issues={filteredIssues}
            title=""
            onResolveIssue={handleResolveIssue}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
