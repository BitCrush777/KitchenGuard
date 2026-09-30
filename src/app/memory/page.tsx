"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  Clock,
  Search,
  ArrowRight,
  ShieldCheck,
  History,
  Box,
  AlertCircle,
  RefreshCw,
  Compass,
} from "lucide-react";
import { TopNavigation } from "@/components/layout/TopNavigation";

interface MemoryEntity {
  id: string;
  displayName: string;
  canonicalName: string;
  entityType: string;
  aliases: string[];
}

interface MemoryRelation {
  id: string;
  subjectEntityId: string;
  subjectName: string;
  relationType: string;
  objectEntityId: string;
  objectName: string;
  locationDescription: string;
  confidence: string;
  isCurrent: boolean;
  observedAt: string;
  inspectionId?: string;
  status: string;
}

interface MemoryEvent {
  id: string;
  eventType: string;
  entityName: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  actor: string;
  sourceText?: string;
}

export default function MemoryPage() {
  const [activeTab, setActiveTab] = useState<"locations" | "fixtures" | "history">("locations");
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState("");
  const [queryResult, setQueryResult] = useState<{
    success: boolean;
    toolName?: string;
    message?: string;
    data?: unknown;
  } | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const [_entities, setEntities] = useState<MemoryEntity[]>([]);
  const [relations, setRelations] = useState<MemoryRelation[]>([]);
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [stats, setStats] = useState({
    totalEntities: 0,
    activeLocations: 0,
    historicalLocations: 0,
    auditEvents: 0,
  });

  const [selectedEntityForHistory, setSelectedEntityForHistory] = useState<string | null>(null);
  const [historyResult, setHistoryResult] = useState<{
    entity: string;
    message: string;
    history: Array<{
      relation: string;
      object: string;
      isCurrent: boolean;
      timestamp: string;
    }>;
  } | null>(null);

  const fetchMemoryData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/memory?kitchenId=kitch-1");
      const json = await res.json();
      if (json.success && json.data) {
        setEntities(json.data.entities || []);
        setRelations(json.data.relations || []);
        setEvents(json.data.events || []);
        setStats(
          json.data.stats || {
            totalEntities: 0,
            activeLocations: 0,
            historicalLocations: 0,
            auditEvents: 0,
          }
        );
      }
    } catch (err) {
      console.error("Failed to load memory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoryData();
  }, []);

  const handleQuery = async (overrideText?: string) => {
    const textToRun = overrideText || queryText;
    if (!textToRun.trim()) return;

    try {
      setIsQuerying(true);
      setQueryResult(null);

      const res = await fetch("/api/memory/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRun, kitchenId: "kitch-1" }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setQueryResult({
          success: true,
          toolName: data.toolName,
          message:
            data.result.message ||
            data.result.voiceResponse ||
            "Query evaluated successfully from memory.",
          data: data.result,
        });
      } else {
        setQueryResult({
          success: false,
          toolName: data.toolName,
          message:
            data.message ||
            data.error ||
            "No recorded memory found matching this question.",
        });
      }
      fetchMemoryData();
    } catch {
      setQueryResult({
        success: false,
        message: "Failed to query kitchen memory system.",
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const handleInspectHistory = async (entityName: string) => {
    setSelectedEntityForHistory(entityName);
    try {
      const res = await fetch("/api/memory/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "history", entity: entityName, kitchenId: "kitch-1" }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setHistoryResult(data.result);
      }
    } catch (err) {
      console.error("History fetch failed:", err);
    }
  };

  const currentRelations = relations.filter((r) => r.isCurrent);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans antialiased flex flex-col pt-24 pb-16">
      <TopNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-surface-container-high">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/20 text-emerald-800 border border-emerald-800/30">
                <Sparkles className="w-3.5 h-3.5" />
                Persistent Spatial Memory
              </span>
              <span className="text-xs text-on-surface-variant font-mono">Kitchen: Main Kitchen (kitch-1)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Kitchen Memory Registry</h1>
            <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
              Factual, long-term memory of tools, equipment, and locations. Retains spatial relations across sessions,
              tracks relocations, and supports forward and reverse voice lookups without hallucination.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMemoryData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-surface-container-high bg-surface-container-low hover:bg-surface-container transition-colors flex items-center gap-1.5 text-on-surface"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Memory
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="bg-surface-container-low border border-surface-container-high p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Recognized Entities
              </span>
              <Box className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-on-surface mt-2">{stats.totalEntities}</div>
            <div className="text-xs text-on-surface-variant/80 mt-1">Tools, fixtures & equipment</div>
          </div>

          <div className="bg-surface-container-low border border-surface-container-high p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Active Locations
              </span>
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-on-surface mt-2">{stats.activeLocations}</div>
            <div className="text-xs text-on-surface-variant/80 mt-1">Current spatial coordinates</div>
          </div>

          <div className="bg-surface-container-low border border-surface-container-high p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Historical Records
              </span>
              <History className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-bold text-on-surface mt-2">{stats.historicalLocations}</div>
            <div className="text-xs text-on-surface-variant/80 mt-1">Moved or corrected items</div>
          </div>

          <div className="bg-surface-container-low border border-surface-container-high p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Audit Trail Events
              </span>
              <ShieldCheck className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-on-surface mt-2">{stats.auditEvents}</div>
            <div className="text-xs text-on-surface-variant/80 mt-1">Immutable change events</div>
          </div>
        </div>

        {/* Live Natural Speech Memory Query Bar */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" />
              Ask KitchenGuard Memory (Spoken or Typed)
            </h2>
            <span className="text-xs text-on-surface-variant">Deterministic Memory Engine</span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                placeholder="e.g. 'Where is the blue bucket?', 'What is under the refrigerator?', 'Where was it before?'"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-container-high bg-surface text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              onClick={() => handleQuery()}
              disabled={isQuerying || !queryText.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/95 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Query Memory"}
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-surface-container-high/60">
            <span className="text-xs text-on-surface-variant font-medium">Try asking:</span>
            {[
              "Where is the blue bucket?",
              "What is under the refrigerator?",
              "Where was the blue bucket before?",
              "What is inside the top drawer?",
              "Where has the blue bucket been recorded?",
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQueryText(s);
                  handleQuery(s);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-surface-container-high/50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Query Result Box */}
          {queryResult && (
            <div
              className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
                queryResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-950"
              }`}
            >
              {queryResult.success ? (
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {queryResult.toolName ? `Engine Tool: ${queryResult.toolName}` : "Memory Response"}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1">{queryResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-surface-container-high mb-6">
          <button
            onClick={() => setActiveTab("locations")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
              activeTab === "locations"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Current Spatial Registry ({currentRelations.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
              activeTab === "history"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <History className="w-4 h-4" />
            Movement & Audit Trail ({events.length})
          </button>
        </div>

        {/* Tab 1: Current Spatial Registry */}
        {activeTab === "locations" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRelations.length === 0 ? (
              <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-surface-container-high">
                <Box className="w-8 h-8 mx-auto mb-2 text-on-surface-variant/40" />
                <p className="text-sm font-semibold">No active object locations recorded yet.</p>
                <p className="text-xs mt-1">Speak an observation like &quot;There is a blue bucket under the refrigerator&quot; to record.</p>
              </div>
            ) : (
              currentRelations.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-surface-container-low border border-surface-container-high hover:border-primary/40 transition-all rounded-2xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-950/10 px-2 py-0.5 rounded-md">
                          Confirmed Location
                        </span>
                        <h3 className="text-base font-bold text-on-surface mt-1.5">{rel.subjectName}</h3>
                      </div>
                      <span className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
                        {rel.relationType}
                      </span>
                    </div>

                    <div className="bg-surface border border-surface-container-high/60 rounded-xl p-3 my-3">
                      <div className="text-xs text-on-surface-variant">Reference Fixture:</div>
                      <div className="text-sm font-bold text-on-surface flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        {rel.objectName}
                      </div>
                      <div className="text-xs text-on-surface-variant/80 mt-1 italic">
                        &ldquo;{rel.locationDescription}&rdquo;
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(rel.observedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <button
                      onClick={() => handleInspectHistory(rel.subjectName)}
                      className="font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      History <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Movement & Audit Trail */}
        {activeTab === "history" && (
          <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Chronological Audit Trail (Immutable Events)
            </h3>

            {events.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-8 text-center">No memory events recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {events
                  .slice()
                  .reverse()
                  .map((evt) => (
                    <div
                      key={evt.id}
                      className="bg-surface border border-surface-container-high/70 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              evt.eventType === "MEMORY_MOVED"
                                ? "bg-amber-500/10 text-amber-800 border border-amber-500/30"
                                : evt.eventType === "MEMORY_CORRECTED"
                                ? "bg-blue-500/10 text-blue-800 border border-blue-500/30"
                                : "bg-emerald-500/10 text-emerald-800 border border-emerald-500/30"
                            }`}
                          >
                            {evt.eventType}
                          </span>
                          <span className="font-bold text-on-surface">{evt.entityName}</span>
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">
                          {evt.oldValue ? (
                            <span>
                              <span className="line-through">{evt.oldValue}</span>
                              <span className="mx-1.5 font-bold text-primary">→</span>
                              <span className="font-semibold text-on-surface">{evt.newValue}</span>
                            </span>
                          ) : (
                            <span>Recorded at: <strong className="text-on-surface">{evt.newValue}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-on-surface-variant sm:text-right shrink-0">
                        <div>{new Date(evt.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</div>
                        <div className="text-on-surface-variant/70 font-mono">Actor: {evt.actor}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Entity History Modal */}
        {selectedEntityForHistory && historyResult && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-surface-container-high rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Chronological Provenance
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mt-1">{historyResult.entity}</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedEntityForHistory(null);
                    setHistoryResult(null);
                  }}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-on-surface-variant mb-4 bg-surface-container-low p-3 rounded-xl border border-surface-container-high">
                {historyResult.message}
              </p>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Movement Timeline:</h4>
                {historyResult.history.map((h, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      h.isCurrent
                        ? "bg-emerald-500/10 border-emerald-500/30 font-semibold"
                        : "bg-surface-container-low border-surface-container-high opacity-80"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-on-surface">{h.relation}</span> the {h.object}
                      {h.isCurrent && (
                        <span className="ml-2 text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Current Location
                        </span>
                      )}
                    </div>
                    <span className="text-on-surface-variant">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedEntityForHistory(null);
                    setHistoryResult(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
