"use client";

import React, { useState } from "react";
import { TopNavigation } from "../../components/layout/TopNavigation";
import { Footer } from "../../components/layout/Footer";
import { RuleCard } from "../../components/rules/RuleCard";
import { initialRules } from "../../services/inspectionData";
import { InspectionRule } from "../../types/inspection";
import { Info } from "lucide-react";

export default function RulesPage() {
  const [rules, setRules] = useState<InspectionRule[]>(initialRules);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { key: "all", label: "All Rules" },
    { key: "Temperature", label: "Temperature Control" },
    { key: "Storage", label: "Food Storage" },
    { key: "Hygiene", label: "Hygiene & Sanitization" },
    { key: "Cleaning", label: "Chemical Titration" },
    { key: "Labels", label: "FIFO & Labeling" },
  ];

  const handleUpdateRule = (updated: InspectionRule) => {
    setRules((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };

  const filteredRules =
    selectedCategory === "all"
      ? rules
      : rules.filter((r) => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <TopNavigation />

      <main className="w-full pt-24 sm:pt-28 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                HACCP Rule Engine
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
                Inspection rules
              </h1>
              <p className="text-sm sm:text-base text-secondary mt-1 max-w-xl">
                Configure the deterministic checks KitchenGuard uses during voice inspections.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-secondary font-medium px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                {rules.filter((r) => r.enabled).length} of {rules.length} Rules Active
              </span>
            </div>
          </div>

          {/* Operational Policy Notice */}
          <div className="bg-[#fef3e2]/60 rounded-2xl p-4 sm:p-5 mb-8 border border-[#c07a1d]/30 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#c07a1d] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#673d00] leading-relaxed">
              <strong className="font-bold">Operational Guidance:</strong> These rules represent configurable kitchen operating standards and HACCP target thresholds configured by the restaurant operator. They provide real-time voice verification assistance and do not constitute automatic legal certification.
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.key
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-low hover:bg-surface-container text-secondary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onUpdateRule={handleUpdateRule}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
