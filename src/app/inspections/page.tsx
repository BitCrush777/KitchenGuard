"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TopNavigation } from "../../components/layout/TopNavigation";
import { Footer } from "../../components/layout/Footer";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { sampleInspectionHistory } from "../../services/inspectionData";
import { Inspection } from "../../types/inspection";
import {
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
} from "lucide-react";

export default function InspectionHistoryPage() {
  const [inspections, setInspections] = useState<Inspection[]>(sampleInspectionHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  React.useEffect(() => {
    async function loadInspections() {
      try {
        const res = await fetch("/api/inspections");
        if (res.ok) {
          const json = await res.json();
          if (json.inspections && json.inspections.length > 0) {
            setInspections(json.inspections);
          }
        }
      } catch (err) {
        console.warn("Failed to load inspections from API:", err);
      }
    }
    loadInspections();
  }, []);

  const filters = [
    { key: "all", label: "All" },
    { key: "opening", label: "Opening" },
    { key: "closing", label: "Closing" },
    { key: "deep-clean", label: "Deep Clean" },
    { key: "needs_review", label: "Needs Attention" },
  ];

  const filteredInspections = inspections.filter((insp) => {
    const matchesFilter =
      activeFilter === "all" ||
      insp.type === activeFilter ||
      (activeFilter === "needs_review" && (insp.status === "needs_review" || insp.issuesCount > 0));

    const matchesSearch =
      insp.typeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insp.kitchen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insp.inspector.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <TopNavigation />

      <main className="w-full pt-24 sm:pt-28 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header & Primary Action */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Audit Registry
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
                Inspections
              </h1>
              <p className="text-sm sm:text-base text-secondary mt-1">
                Review previous kitchen checks and their outcomes.
              </p>
            </div>

            <Link
              href="/inspections/new"
              className="px-6 h-[48px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Start Inspection</span>
            </Link>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-surface-container-high/60 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inspections by name, location, or ID…"
                className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === f.key
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low hover:bg-surface-container text-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inspection Records List */}
          <div className="space-y-3.5">
            {filteredInspections.map((insp) => (
              <div
                key={insp.id}
                className="w-full bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container-high/60 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-base text-on-surface">
                        {insp.typeName}
                      </span>
                      <span className="text-xs text-secondary font-medium">
                        · {insp.kitchen}
                      </span>
                      <StatusBadge status={insp.status} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-secondary mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        {insp.id}
                      </span>
                      <span>Sep 28 · 10:46 AM</span>
                      <span>Inspector: {insp.inspector}</span>
                    </div>

                    <div className="flex items-center gap-3 mt-2.5 text-xs">
                      <span className="inline-flex items-center gap-1 text-primary font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {insp.checkpointsCompleted}/{insp.checkpointsTotal} verified
                      </span>
                      {insp.issuesCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[#c07a1d] font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {insp.issuesCount} issues ({insp.issuesResolved} resolved)
                        </span>
                      ) : (
                        <span className="text-secondary">0 issues</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <Link
                    href={`/inspections/${insp.id}`}
                    className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>View Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/reports"
                    className="px-4 py-2.5 rounded-xl bg-primary-fixed hover:bg-[#b8e2b8] text-on-primary-fixed font-semibold text-xs transition-colors"
                  >
                    Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
