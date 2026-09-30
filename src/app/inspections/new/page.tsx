"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TopNavigation } from "../../../components/layout/TopNavigation";
import { Footer } from "../../../components/layout/Footer";
import {
  InspectionTypeCard,
  InspectionTypeOption,
} from "../../../components/inspections/InspectionTypeCard";
import {
  ArrowLeft,
  Sunrise,
  Moon,
  Sparkles,
  Mic,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UtensilsCrossed,
  Activity,
  Headphones,
} from "lucide-react";

export default function StartInspectionPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] =
    useState<InspectionTypeOption["id"]>("opening");

  const workflowOptions: InspectionTypeOption[] = [
    {
      id: "opening",
      protocol: "Protocol 01",
      title: "Opening",
      description:
        "Verify critical refrigeration, prep station sanitized surfaces, and opening checklist.",
      duration: "5–8 minutes",
      checkpointsCount: "8 key checkpoints",
      icon: Sunrise,
    },
    {
      id: "closing",
      protocol: "Protocol 02",
      title: "Closing",
      description:
        "End-of-day cold storage lockdown, waste disposal verification, and equipment power-down.",
      duration: "8–10 minutes",
      checkpointsCount: "12 checkpoints",
      icon: Moon,
    },
    {
      id: "deep-clean",
      protocol: "Protocol 03",
      title: "Deep Clean",
      description:
        "Weekly sanitation audit of hoods, walk-in drainage, line sanitation, and chemical storage.",
      duration: "15–20 minutes",
      checkpointsCount: "16 checkpoints",
      icon: Sparkles,
    },
    {
      id: "custom-voice",
      protocol: "Protocol 04 · Freeform",
      title: "Custom Voice Audit",
      description:
        "Walk freely and speak any observation. KitchenGuard routes items to the appropriate safety rules automatically.",
      duration: "Flexible duration",
      checkpointsCount: "Freeform observation",
      icon: Mic,
    },
  ];

  const currentOption = workflowOptions.find((o) => o.id === selectedType);

  const handleStart = async () => {
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionType: selectedType,
          kitchen: "Main Kitchen",
          inspector: "Arun Patel",
        }),
      });
      const data = await res.json();
      if (data.data?.id) {
        router.push(`/inspections/live?id=${data.data.id}&type=${selectedType}`);
        return;
      }
    } catch (err) {
      console.warn("Failed to create inspection via API, falling back:", err);
    }
    router.push(`/inspections/live?type=${selectedType}`);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <TopNavigation />

      <main className="w-full pt-24 sm:pt-28 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-8 pb-12">
            {/* Top Navigation Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm font-semibold group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Overview</span>
              </Link>

              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="tracking-wide uppercase font-semibold">
                  Session Protocol 04-A
                </span>
                <span className="text-outline-variant">•</span>
                <span>Shift: Morning Line Prep</span>
              </div>
            </div>

            {/* Header Block & Acoustic Status Beacon */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Walkthrough Configuration
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight mt-1">
                  Start an inspection.
                </h1>
                <p className="text-base sm:text-lg text-on-surface-variant mt-2 leading-relaxed">
                  Select an inspection workflow or trigger a custom voice walkthrough.
                </p>
              </div>

              {/* Visual Audio Status Beacon */}
              <div className="flex items-center gap-3.5 p-4 bg-surface-container-low rounded-2xl shadow-sm self-start lg:self-auto border border-surface-container-high/60">
                <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-surface-container-lowest text-primary shadow-sm">
                  <Headphones className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary-fixed-dim border-2 border-surface" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">Microphone Calibrated</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold">
                      99.4% Clarity
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">
                    Acoustic background noise suppression active
                  </p>
                </div>
              </div>
            </div>

            {/* Four Selectable Workflow Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {workflowOptions.map((opt) => (
                <InspectionTypeCard
                  key={opt.id}
                  option={opt}
                  selected={selectedType === opt.id}
                  onSelect={(id) => setSelectedType(id)}
                />
              ))}
            </div>

            {/* Visual Storytelling Ribbon: Modern Culinary Environment Glance */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-low shadow-sm border border-surface-container-high/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <div className="relative h-40 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Immature commercial stainless steel kitchen prep table"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLNvS2FlXpJJTSt2r_drzZWnMwgPGr15YyboOYXCiYR6geJJCKcS8gu9a88-FytgaTvjjLjZR9ghbv_F4DPRM5wizvguTfFeviy0qo0gJ-pm-ocg1KhDA07mXGgvH9ztSY3KsHBSsULqClsTCQVYxWCxhi0K-e8muePoWJ6xxbeFN9y8fTvLFnjWDvsFCybe6aYytuO2fLuINAzsqVH7ph4OqFkDrFdYLveWWliiH-4pEzgwZsWOjQhQ"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent flex flex-col justify-end p-4 text-on-primary">
                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">
                      Zone 1
                    </span>
                    <span className="text-xs font-bold">Cold Storage & Dairy</span>
                  </div>
                </div>

                <div className="relative h-40 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Chef inspecting temperature display with probe"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5MpVShZajsV5hKyY12ujAjPuTB-zo4NDyYwmZDcPN52lPUYEYvmWV_4nze_IC2i-vV9-nGNabNHLH37Y_T1xY9GU0HHssDaUvzCk8ES8cqxuEtNxHahW3pFKnjiJ1em49_LZigsIz7hFeVCHqIRYCus24rA-AiXbhDC-6E58004FQwHN24UX3de93G7ufmzw8WsnG-un0s5_PgAo5I4jSYpdXYANvgBlfUxwEe0lETbMI-_J3DlRP9w"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent flex flex-col justify-end p-4 text-on-primary">
                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">
                      Zone 2
                    </span>
                    <span className="text-xs font-bold">Sauté & Hot Hold Station</span>
                  </div>
                </div>

                <div className="relative h-40 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Stainless steel sanitary wash line and sanitizer test strip stations"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMLlhyIccAiAWt1u_uAlu056yNWN3w1_viJb7xCfGLvQIcH54cb9ov5_Pk3QMLwWwVUqgd08HG2B7uBoxQEjpyr6rB9UmotigRrxnxeYK7ZR0RwsrlHSOkZ5xUfjDxGc7XqGmoCv08mq45sBNLcAzT2Cunf4k-O7x6GMhXUWr-TZzYNiAjfy76PU00ZQTXeOKbL8PgESEKFF99M8kl9o75OnWJVh638lZpVoz0-FOBvv04LHURESf30g"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent flex flex-col justify-end p-4 text-on-primary">
                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">
                      Zone 3
                    </span>
                    <span className="text-xs font-bold">Sanitizer & Warewash Line</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Parameters Bar */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md flex flex-col gap-4 border border-surface-container-high/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary text-sm font-bold">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Inspection Parameters</span>
                </div>
                <span className="text-xs text-secondary">
                  Standard Food Safety (HACCP Aligned)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container-high/40">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Kitchen Location
                  </span>
                  <div className="flex items-center gap-1.5 text-on-surface font-semibold text-sm mt-1">
                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                    <span>Main Kitchen</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container-high/40">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Checklist Rules
                  </span>
                  <div className="flex items-center gap-1.5 text-on-surface font-semibold text-sm mt-1">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Standard Food Safety</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container-high/40">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Audio Channel
                  </span>
                  <div className="flex items-center gap-2 text-on-surface font-semibold text-sm mt-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>Hands-Free Mic Active</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container-high/40">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Estimated Duration
                  </span>
                  <div className="flex items-center gap-1.5 text-on-surface font-semibold text-sm mt-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{currentOption?.duration || "5–8 minutes"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Center */}
            <div className="bg-surface-container-low/70 rounded-2xl p-6 sm:p-10 flex flex-col items-center text-center gap-4 shadow-sm border border-surface-container-high/60">
              {/* Subtle Voice Wave Sim */}
              <div className="flex items-center gap-1.5 h-6 text-primary">
                <span className="w-1 h-3 rounded-full bg-primary/40 animate-pulse" />
                <span className="w-1 h-5 rounded-full bg-primary animate-pulse delay-150" />
                <span className="w-1 h-2 rounded-full bg-primary/60 animate-pulse delay-300" />
                <span className="w-1 h-6 rounded-full bg-primary animate-pulse delay-75" />
                <span className="w-1 h-3 rounded-full bg-primary/40 animate-pulse delay-200" />
              </div>

              {/* Main CTA with tactile spring feedback */}
              <div className="w-full max-w-md">
                <motion.button
                  type="button"
                  onClick={handleStart}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-full h-14 bg-primary text-on-primary hover:bg-primary-container transition-colors rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Voice Inspection</span>
                  <Activity className="w-4 h-4 opacity-70" />
                </motion.button>
              </div>

              {/* Reassurance Microcopy */}
              <div className="flex items-center gap-2 text-secondary text-xs sm:text-sm max-w-lg">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span>
                  Keep your hands free. Speak naturally while walking through the kitchen. KitchenGuard will guide you through required checks.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
