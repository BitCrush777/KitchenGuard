"use client";

import React, { useState } from "react";
import { Issue } from "../../types/inspection";
import { IssueDrawer } from "./IssueDrawer";
import { StatusBadge } from "../ui/StatusBadge";
import { IssueReveal } from "../magic/IssueReveal";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  User,
  Check,
} from "lucide-react";

interface IssueListProps {
  issues: Issue[];
  title?: string;
  showViewAll?: boolean;
  onResolveIssue?: (id: string) => void;
}

export function IssueList({
  issues: propIssues,
  title = "Needs attention",
  showViewAll = true,
  onResolveIssue,
}: IssueListProps) {
  const [issues, setIssues] = useState<Issue[]>(propIssues);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleResolve = (id: string) => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === id
          ? {
              ...iss,
              status: "resolved",
              resolvedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : iss
      )
    );
    if (selectedIssue && selectedIssue.id === id) {
      setSelectedIssue((prev) =>
        prev
          ? {
              ...prev,
              status: "resolved",
            }
          : null
      );
    }
    onResolveIssue?.(id);
  };

  const openIssuesCount = issues.filter((i) => i.status !== "resolved").length;

  return (
    <section className="w-full mb-8">
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-on-surface tracking-tight">
            {title}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-[#ffdcbb] text-[#673d00] text-xs font-semibold">
            {openIssuesCount} open
          </span>
        </div>
        {showViewAll && (
          <a
            href="/issues"
            className="text-secondary hover:text-on-surface text-xs font-medium transition-colors"
          >
            View All Logged Issues
          </a>
        )}
      </div>

      <div className="space-y-4">
        {issues.map((issue, index) => {
          const isResolved = issue.status === "resolved";
          const isHigh = issue.severity === "high" || issue.severity === "critical";

          return (
            <IssueReveal
              key={issue.id}
              severity={issue.severity}
              delay={index * 0.08}
            >
              <div
                className={`w-full rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:shadow-md border ${
                  isResolved
                    ? "bg-surface-container-low/70 border-surface-container-high/40 opacity-90"
                    : "bg-surface-container-lowest border-surface-container-high/60"
                }`}
              >
              <div className="flex items-start gap-4 max-w-3xl">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isResolved
                      ? "bg-primary-fixed text-on-primary-fixed"
                      : isHigh
                      ? "bg-error-container text-on-error-container"
                      : "bg-[#ffdcbb] text-[#673d00]"
                  }`}
                >
                  {isResolved ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isHigh ? (
                    <AlertCircle className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm sm:text-base text-on-surface">
                      {issue.title}
                    </span>
                    <StatusBadge
                      status={issue.severity}
                      label={`${issue.severity} Priority`}
                      size="sm"
                    />
                    <StatusBadge status={issue.status} size="sm" />
                    <span className="text-secondary text-xs">· {issue.createdAt} via Voice Log</span>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-secondary text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {issue.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Logged by {issue.loggedBy}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 lg:flex-shrink-0 self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(issue)}
                  className="px-4 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors cursor-pointer"
                >
                  View Details
                </button>

                {!isResolved ? (
                  <button
                    type="button"
                    onClick={() => handleResolve(issue.id)}
                    className="px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{issue.category === "Hand Washing" ? "Restock & Verify" : "Mark Resolved"}</span>
                  </button>
                ) : (
                  <span className="text-xs text-primary font-medium px-3 py-1 bg-primary-fixed rounded-md">
                    Verified Corrected
                  </span>
                )}
              </div>
            </div>
          </IssueReveal>
        );
      })}
      </div>

      {/* Drawer */}
      <IssueDrawer
        issue={selectedIssue}
        isOpen={Boolean(selectedIssue)}
        onClose={() => setSelectedIssue(null)}
        onResolve={handleResolve}
      />
    </section>
  );
}
