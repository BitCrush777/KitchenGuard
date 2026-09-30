import React from "react";
import { Clock, Check, AlertCircle } from "lucide-react";

interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  inspector: string;
  status: "completed" | "issues" | "upcoming";
  statusText: string;
  badgeText: string;
}

export function InspectionTimeline() {
  const items: TimelineItem[] = [
    {
      id: "1",
      time: "08:30",
      title: "Opening Inspection",
      description: "Sanitizer baselines, prep reach-in temp check, pest perimeter check.",
      inspector: "Marcus K.",
      status: "completed",
      statusText: "100% Pass",
      badgeText: "Completed",
    },
    {
      id: "2",
      time: "11:20",
      title: "Cold Storage",
      description: "Main walk-in chillers, meat preservation unit, ambient door alarms.",
      inspector: "Arun (You)",
      status: "completed",
      statusText: "1 Rectified",
      badgeText: "Completed",
    },
    {
      id: "3",
      time: "13:10",
      title: "Kitchen Walkthrough",
      description: "Hand-wash stocks, cross-contamination barriers, dry storage labeling.",
      inspector: "Arun (You)",
      status: "issues",
      statusText: "Requires Sign-off",
      badgeText: "2 Issues",
    },
    {
      id: "4",
      time: "16:30",
      title: "Closing Inspection",
      description: "End-of-shift line scrub down, oil disposal log, final reach-in latches.",
      inspector: "Assigned: Marcus K.",
      status: "upcoming",
      statusText: "In 2h 45m",
      badgeText: "Upcoming",
    },
  ];

  return (
    <section className="w-full mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-on-surface tracking-tight">
            Today&apos;s Inspection Timeline
          </h2>
          <p className="text-xs sm:text-sm text-secondary">
            Chronological sequence of mandated HACCP checks and line sweeps.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-secondary text-xs">
          <Clock className="w-4 h-4" />
          <span>Last updated: 14 mins ago</span>
        </div>
      </div>

      {/* Spacious Stage Architecture */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative">
          {items.map((item) => {
            const isCompleted = item.status === "completed";
            const hasIssues = item.status === "issues";

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between p-5 rounded-xl transition-all border ${
                  hasIssues
                    ? "bg-[#fef3e2]/40 border-[#c07a1d]/30 hover:bg-[#fef3e2]/60"
                    : "bg-surface-container-low border-surface-container-high/40 hover:bg-surface-container"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-on-surface">{item.time}</span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold">
                        <Check className="w-3 h-3" /> {item.badgeText}
                      </span>
                    )}
                    {hasIssues && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdcbb] text-[#673d00] text-xs font-semibold">
                        <AlertCircle className="w-3 h-3" /> {item.badgeText}
                      </span>
                    )}
                    {item.status === "upcoming" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-highest text-secondary text-xs font-medium">
                        {item.badgeText}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-on-surface">{item.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-container-high/50 text-secondary text-xs">
                  <span>{item.inspector}</span>
                  <span
                    className={`font-semibold ${
                      isCompleted
                        ? "text-primary"
                        : hasIssues
                        ? "text-[#c07a1d]"
                        : "text-outline"
                    }`}
                  >
                    {item.statusText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
