"use client";

import React, { useState } from "react";
import { TopNavigation } from "../../components/layout/TopNavigation";
import { Footer } from "../../components/layout/Footer";
import {
  UtensilsCrossed,
  Building,
  ClipboardList,
  ShieldCheck,
  Users,
  Mic,
  Bell,
  Check,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("restaurant");
  const [savedMessage, setSavedMessage] = useState(false);

  // Form states
  const [restaurantName, setRestaurantName] = useState("Aurelia Dining & Bistro");
  const [kitchenName, setKitchenName] = useState("Main Kitchen (Basement 1)");
  const [voiceNoiseCancellation, setVoiceNoiseCancellation] = useState(true);
  const [haccpStrictness, setHaccpStrictness] = useState("strict");
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [notificationAlerts, setNotificationAlerts] = useState(true);

  const sections = [
    { id: "restaurant", label: "Restaurant information", icon: Building },
    { id: "kitchen", label: "Kitchen configuration", icon: UtensilsCrossed },
    { id: "checklists", label: "Inspection checklists", icon: ClipboardList },
    { id: "rules", label: "Food safety rules", icon: ShieldCheck },
    { id: "users", label: "Users & roles", icon: Users },
    { id: "voice", label: "Voice settings", icon: Mic },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <TopNavigation />

      <main className="w-full pt-24 sm:pt-28 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Administration
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight mt-1">
              Settings
            </h1>
            <p className="text-sm sm:text-base text-secondary mt-1">
              Configure restaurant metadata, voice sensitivity, and operational checklists.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar navigation */}
            <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-3 shadow-sm border border-surface-container-high/60 space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const active = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveTab(sec.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-left cursor-pointer ${
                      active
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-secondary hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main settings panel */}
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-surface-container-high/60">
              <form onSubmit={handleSave} className="space-y-6">
                {/* 1. Restaurant information */}
                {activeTab === "restaurant" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">Restaurant Information</h2>
                      <p className="text-xs text-secondary mt-0.5">
                        Brand identity displayed on official audit reports and certificates.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">
                          Establishment Name
                        </label>
                        <input
                          type="text"
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                          className="w-full text-sm font-medium px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">
                            City & Country
                          </label>
                          <input
                            type="text"
                            defaultValue="New York, NY (USA)"
                            className="w-full text-sm font-medium px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">
                            HACCP Accreditation ID
                          </label>
                          <input
                            type="text"
                            defaultValue="HACCP-NYC-2026-991"
                            className="w-full text-sm font-medium font-mono px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Kitchen configuration */}
                {activeTab === "kitchen" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">Kitchen Configuration</h2>
                      <p className="text-xs text-secondary mt-0.5">
                        Manage zones, refrigeration units, and prep passes.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">
                          Primary Kitchen Name
                        </label>
                        <input
                          type="text"
                          value={kitchenName}
                          onChange={(e) => setKitchenName(e.target.value)}
                          className="w-full text-sm font-medium px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-on-surface block">
                            Walk-In Complex Zone
                          </span>
                          <span className="text-xs text-secondary">
                            Includes Walk-in Refrigerator #1, #2 and Deep Freeze Vault
                          </span>
                        </div>
                        <span className="text-xs text-primary font-bold px-2.5 py-1 bg-primary-fixed rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Inspection checklists */}
                {activeTab === "checklists" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">Inspection Checklists</h2>
                      <p className="text-xs text-secondary mt-0.5">
                        Standard operational checkpoints mapped to daily shifts.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-on-surface block">
                            Opening Shift Protocol (8 checkpoints)
                          </span>
                          <span className="text-xs text-secondary">
                            Mandatory cold storage, surface sanitation, and line temp sweep
                          </span>
                        </div>
                        <span className="text-xs text-primary font-bold">Standard</span>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-on-surface block">
                            Closing Shift Lockdown (12 checkpoints)
                          </span>
                          <span className="text-xs text-secondary">
                            Refrigeration seal check, waste removal, power-down log
                          </span>
                        </div>
                        <span className="text-xs text-primary font-bold">Standard</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Food safety rules */}
                {activeTab === "rules" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">Food Safety Thresholds</h2>
                      <p className="text-xs text-secondary mt-0.5">
                        Deterministic validation settings used during voice capture.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">
                          Enforcement Strictness
                        </label>
                        <select
                          value={haccpStrictness}
                          onChange={(e) => setHaccpStrictness(e.target.value)}
                          className="w-full text-sm font-medium px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="strict">Michelin Strict (Flag drift &gt; 0.5°C)</option>
                          <option value="standard">Standard Commercial HACCP (Flag drift &gt; 1.0°C)</option>
                          <option value="advisory">Advisory Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Users & roles */}
                {activeTab === "users" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">Kitchen Staff & Roles</h2>
                      <p className="text-xs text-secondary mt-0.5">
                        Authorized inspectors and supervisors with voice signature authority.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
                            AP
                          </div>
                          <div>
                            <span className="text-sm font-bold text-on-surface block">
                              Arun Patel
                            </span>
                            <span className="text-xs text-secondary">
                              Kitchen Manager · Full Sign-off Authority
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-primary font-semibold px-2.5 py-1 bg-primary-fixed rounded-full">
                          Lead
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-secondary font-bold text-xs">
                            MK
                          </div>
                          <div>
                            <span className="text-sm font-bold text-on-surface block">
                              Marcus Kowalski
                            </span>
                            <span className="text-xs text-secondary">Sous Chef · Line Inspector</span>
                          </div>
                        </div>
                        <span className="text-xs text-secondary font-medium">Inspector</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Voice settings */}
                {activeTab === "voice" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">AssemblyAI Voice Engine</h2>
                      <p className="text-xs text-secondary mt-0.5">
                        Real-time acoustic configuration and background kitchen noise filters.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50">
                        <div>
                          <span className="text-sm font-bold text-on-surface block">
                            Kitchen Noise Suppression
                          </span>
                          <span className="text-xs text-secondary">
                            Filters hood fans, running water, and dish clatter from microphone feed
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVoiceNoiseCancellation(!voiceNoiseCancellation)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            voiceNoiseCancellation ? "bg-primary" : "bg-surface-container-highest"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              voiceNoiseCancellation ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50">
                        <div>
                          <span className="text-sm font-bold text-on-surface block">
                            Spoken Audio Confirmation
                          </span>
                          <span className="text-xs text-secondary">
                            KitchenGuard speaks brief audible confirms after each logged observation
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAudioFeedback(!audioFeedback)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            audioFeedback ? "bg-primary" : "bg-surface-container-highest"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              audioFeedback ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. Notifications */}
                {activeTab === "notifications" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">Operational Alerts</h2>
                      <p className="text-xs text-secondary mt-0.5">
                        Dispatch urgent HACCP alerts to kitchen managers.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50">
                        <div>
                          <span className="text-sm font-bold text-on-surface block">
                            Critical Cross-Contamination Pushes
                          </span>
                          <span className="text-xs text-secondary">
                            Immediate mobile notification if raw food storage rules are breached
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotificationAlerts(!notificationAlerts)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationAlerts ? "bg-primary" : "bg-surface-container-highest"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationAlerts ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Save Button */}
                <div className="flex items-center justify-between pt-6 border-t border-surface-container">
                  {savedMessage ? (
                    <span className="text-xs text-primary font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Preferences saved successfully.
                    </span>
                  ) : (
                    <span className="text-xs text-secondary">All changes apply immediately.</span>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
