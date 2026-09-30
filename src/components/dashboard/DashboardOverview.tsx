"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { NumberTicker } from "../magic/NumberTicker";

interface DashboardOverviewProps {
  readinessScore?: number;
  scheduledCount?: number;
  completedCount?: number;
  attentionCount?: number;
}

export function DashboardOverview({
  readinessScore = 87,
  scheduledCount = 12,
  completedCount = 10,
  attentionCount = 2,
}: DashboardOverviewProps) {
  // SVG circle calculation for readiness gauge
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ~427.26
  const strokeDashoffset = circumference - (circumference * readinessScore) / 100;

  return (
    <div className="flex flex-col w-full">
      {/* Top Editorial Header & Kitchen Context Bar */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <span className="text-xl font-medium tracking-tight text-secondary">
              Good morning, Arun.
            </span>
            <span className="text-outline">·</span>
            <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
              Line Readiness Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-on-surface mb-3">
            Kitchen status at a glance.
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant max-w-xl">
            Stay ahead of today&apos;s inspections, unresolved issues, and kitchen checks before the evening service rush.
          </p>
        </div>

        {/* Actions & Shift Context Pill */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface-container-low shadow-sm">
            <Calendar className="w-5 h-5 text-secondary" />
            <div className="flex flex-col">
              <span className="text-[11px] text-secondary uppercase tracking-wider leading-none">
                Shift Cycle
              </span>
              <span className="text-sm font-semibold text-on-surface leading-tight mt-0.5">
                Today · Main Kitchen
              </span>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              href="/inspections/new"
              className="group flex items-center justify-center gap-2 px-6 h-[52px] rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-md hover:bg-primary-container transition-all"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span>Start Inspection</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Hero Status Section: Architectural Unified Readiness Dashboard */}
      <section className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 mb-8 relative overflow-hidden border border-surface-container-high/60">
        {/* Warm ambient backdrop blurs */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-32 w-80 h-80 rounded-full bg-tertiary-fixed/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Precision Readiness Gauge */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <svg
                aria-hidden="true"
                className="w-44 h-44 -rotate-90 transform"
                viewBox="0 0 160 160"
              >
                <circle
                  className="text-surface-container"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                />
                <motion.circle
                  className="text-primary-container"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r={radius}
                  stroke="currentColor"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  strokeLinecap="round"
                  strokeWidth="12"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl sm:text-5xl font-semibold text-on-surface tracking-tight leading-none flex items-baseline">
                  <NumberTicker value={readinessScore} delay={0.1} />
                  <span className="text-2xl font-normal text-secondary ml-0.5">%</span>
                </span>
                <span className="text-[11px] text-secondary uppercase tracking-widest mt-1 font-semibold">
                  Readiness
                </span>
              </div>
            </div>

            <div className="flex flex-col text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed w-fit mx-auto sm:mx-0 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold">Ready for Opening</span>
              </div>
              <h2 className="text-2xl font-semibold text-on-surface tracking-tight">Main Kitchen</h2>
              <p className="text-sm text-on-surface-variant mt-1 max-w-sm">
                2 critical checks pending supervisor sign-off before 17:00 dinner seating.
              </p>
              <div className="flex items-center gap-2 mt-3 text-secondary text-xs justify-center sm:justify-start">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>HACCP Tier 1 Compliance Met</span>
              </div>
            </div>
          </div>

          {/* Right: Tonal Stats Cards with NumberTicker */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-low rounded-xl p-5 flex flex-col justify-between transition-all hover:bg-surface-container border border-surface-container-high/40">
              <div className="flex items-center justify-between text-secondary mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Scheduled</span>
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="text-3xl font-semibold text-on-surface tracking-tight">
                  <NumberTicker value={scheduledCount} delay={0.15} />
                </div>
                <div className="text-xs text-secondary mt-1">Kitchen logs slated</div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-5 flex flex-col justify-between transition-all hover:bg-surface-container border border-surface-container-high/40">
              <div className="flex items-center justify-between text-primary mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Completed
                </span>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-semibold text-on-surface tracking-tight">
                  <NumberTicker value={completedCount} delay={0.25} />
                </div>
                <div className="text-xs text-secondary mt-1">83% protocol pass rate</div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-5 flex flex-col justify-between transition-all hover:bg-surface-container border border-surface-container-high/40">
              <div className="flex items-center justify-between text-[#c07a1d] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c07a1d]">
                  Attention
                </span>
                <AlertTriangle className="w-5 h-5 text-[#c07a1d]" />
              </div>
              <div>
                <div className="text-3xl font-semibold text-[#c07a1d] tracking-tight">
                  <NumberTicker value={attentionCount} delay={0.35} />
                </div>
                <div className="text-xs text-secondary mt-1">Immediate flags require sign-off</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Telemetry & Line Snapshot */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm border border-surface-container-high/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
                Active Protocol
              </span>
              <h3 className="text-xl font-semibold text-on-surface">Walk-in Line & Temp Log</h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-xs text-on-surface font-medium">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Voice Log Enabled</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
            <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container-high/40">
              <span className="text-xs text-secondary font-medium block">
                Walk-In Refrigerator #1
              </span>
              <span className="text-2xl font-bold text-on-surface mt-1 block">2.4°C</span>
              <span className="text-xs text-primary flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Target: 0–4°C
              </span>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container-high/40">
              <span className="text-xs text-secondary font-medium block">
                Walk-In Refrigerator #2
              </span>
              <span className="text-2xl font-bold text-[#c07a1d] mt-1 block">4.9°C</span>
              <span className="text-xs text-[#c07a1d] flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> +0.9°C Over Target
              </span>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container-high/40">
              <span className="text-xs text-secondary font-medium block">
                Deep Freeze Station #1
              </span>
              <span className="text-2xl font-bold text-on-surface mt-1 block">-19.2°C</span>
              <span className="text-xs text-primary flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Target: &lt; -18°C
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-surface-container text-secondary text-xs">
            <span>Continuous telemetry streamed via calibrated probes</span>
            <Link
              href="/inspections"
              className="text-primary font-semibold hover:underline flex items-center gap-1"
            >
              Review Cold Chain Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Editorial Chef Line Visual Snapshot */}
        <div className="lg:col-span-4 rounded-2xl overflow-hidden shadow-sm relative min-h-[220px] bg-surface-container">
          <img
            className="w-full h-full object-cover"
            alt="Michelin-grade restaurant kitchen prep station"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXRdjv4f0I_Z7_ygBblY2vUv5VboKO4sE-_D9XoejelJXChd-YRY4sh2amItLUeoS7GbqQC0eGcR0tfvD_5cLLT3JB0WqxthH_ahy-pstaACKOQRFq_WJ0ZiSLzmm_yXhtS2L6jD9JW0sH8KP5rN4LNRBYuD85WXpPU67OVcSYZI1jVlKv7_P6W5snSXmq9bFrYu20D8PR3aGqams5rS-w2jxvQ9f3UC1ueUIAtojaGJcn8QLLQ2AOKA"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/30 to-transparent flex flex-col justify-end p-5 text-inverse-on-surface">
            <span className="text-[11px] uppercase tracking-wider text-primary-fixed font-semibold">
              Pass Station 1
            </span>
            <span className="text-base font-semibold leading-snug mt-0.5">
              Executive Sous Chef Julian active on fish station prep
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
