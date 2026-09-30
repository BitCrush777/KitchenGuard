"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  VoiceAgentConnectionState,
  AssemblyAIToolCall,
} from "../types/assemblyai";
import {
  TranscriptMessage,
  VoiceActivityState,
  Observation,
  Inspection,
} from "../types/inspection";
import { assemblyAIService } from "../services/assemblyAIService";
import { sampleTranscripts, sampleObservations } from "../services/inspectionData";
import { parseSpokenInspectionIntent } from "../lib/inspection/tools/intentParser";
import { LocalInspectionStore } from "../lib/inspection/persistence/local-inspection-store";
import { LocalMemoryStore } from "../lib/memory/local-memory-store";

export interface UseVoiceAgentOptions {
  inspectionId?: string;
  autoConnect?: boolean;
  onObservationUpdate?: (obs: Observation) => void;
  onRuleTrigger?: (ruleName: string, detail: string) => void;
}

export function useVoiceAgent(options: UseVoiceAgentOptions = {}) {
  const [connectionState, setConnectionState] =
    useState<VoiceAgentConnectionState>("connected");
  const [voiceState, setVoiceState] = useState<VoiceActivityState>("listening");
  const [currentSpeaker, setCurrentSpeaker] = useState<"worker" | "assistant" | null>("assistant");
  const [isListening, setIsListening] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioClarityScore, setAudioClarityScore] = useState<number>(99.4);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>(sampleTranscripts.slice(0, 4));
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [activeObservation, setActiveObservation] = useState<Observation | null>(sampleObservations[0]);
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
  const [lastToolCall, setLastToolCall] = useState<AssemblyAIToolCall | null>({
    name: "recordObservation",
    params: {
      checkpointId: "chk-1",
      itemName: "Walk-in refrigerator",
      observedValue: "6°C",
      unit: "°C",
      rawSpeech: "Actually, the refrigerator was six degrees, not four.",
    },
  });

  const stepIndexRef = useRef<number>(4);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Fetch active inspection state from backend on mount
  const refreshInspection = useCallback(async () => {
    try {
      if (options.inspectionId) {
        const res = await fetch(`/api/inspections/${options.inspectionId}`);
        if (res.ok) {
          const active = await res.json();
          if (active && active.id) {
            setCurrentInspection(active);
            LocalInspectionStore.saveState({
              inspection: active,
              checkpoints: active.checkpoints || [],
              observations: active.observations || [],
              issues: active.issues || [],
              corrections: active.corrections || [],
              auditEvents: active.events || [],
            });
            if (active.transcripts && active.transcripts.length > 0) {
              setTranscript(active.transcripts);
            }
            if (active.observations && active.observations.length > 0) {
              setActiveObservation(active.observations[active.observations.length - 1]);
            }
            return;
          }
        }
      }

      const res = await fetch("/api/inspections");
      if (res.ok) {
        const json = await res.json();
        if (json.inspections && json.inspections.length > 0) {
          const active = json.inspections[0];
          setCurrentInspection(active);
          LocalInspectionStore.saveState({
            inspection: active,
            checkpoints: active.checkpoints || [],
            observations: active.observations || [],
            issues: active.issues || [],
            corrections: active.corrections || [],
            auditEvents: active.events || [],
          });
          if (active.transcripts && active.transcripts.length > 0) {
            setTranscript(active.transcripts);
          }
          if (active.observations && active.observations.length > 0) {
            setActiveObservation(active.observations[active.observations.length - 1]);
          }
          return;
        }
      }

      // Fallback: restore from browser localStorage kitchenguard:inspection:v1
      const localState = LocalInspectionStore.getState();
      if (localState && localState.inspection) {
        setCurrentInspection(localState.inspection);
        if (localState.observations && localState.observations.length > 0) {
          setActiveObservation(localState.observations[localState.observations.length - 1]);
        }
      }
    } catch (err) {
      console.warn("[useVoiceAgent] Failed to load inspections from API, using localStorage:", err);
      const localState = LocalInspectionStore.getState();
      if (localState && localState.inspection) {
        setCurrentInspection(localState.inspection);
        if (localState.observations && localState.observations.length > 0) {
          setActiveObservation(localState.observations[localState.observations.length - 1]);
        }
      }
    }
  }, [options.inspectionId]);

  useEffect(() => {
    refreshInspection();
  }, [refreshInspection]);

  // Stop live recording and close socket
  const stopLiveAudio = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({ type: "Terminate" }));
        } catch {}
      }
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  // Vocalize assistant responses hands-free through Web Speech Synthesis API
  const speakVoiceResponse = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceState("speaking");
      setTimeout(() => {
        setVoiceState("listening");
        setCurrentSpeaker("worker");
      }, 1600);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Daniel"))
        ) || voices.find((v) => v.lang.startsWith("en"));

      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => {
        setVoiceState("speaking");
        setCurrentSpeaker("assistant");
      };

      utterance.onend = () => {
        setVoiceState("listening");
        setCurrentSpeaker("worker");
      };

      utterance.onerror = () => {
        setVoiceState("listening");
        setCurrentSpeaker("worker");
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setVoiceState("listening");
      setCurrentSpeaker("worker");
    }
  }, []);

  // Process spoken speech: Invokes deterministic server tool execution
  const processSpokenInspection = useCallback(
    async (text: string) => {
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // 1. Add worker message to UI transcript
      const userMsgId = `worker-${Date.now()}`;
      const newWorkerMsg: TranscriptMessage = {
        id: userMsgId,
        speaker: "worker",
        speakerName: "Arun",
        role: "Kitchen Supervisor",
        text,
        timestamp,
      };

      setTranscript((prev) => [...prev, newWorkerMsg]);
      setIsProcessing(true);
      setVoiceState("processing");
      setCurrentSpeaker("assistant");

      // 2. Parse intent into structured tool call
      const intent = parseSpokenInspectionIntent(text);

      setLastToolCall({
        name: intent.toolName,
        params: intent.parameters,
      });

      try {
        // 3. Execute tool against deterministic backend engine
        const res = await fetch("/api/tools/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolName: intent.toolName,
            parameters: {
              ...intent.parameters,
              inspectionId: options.inspectionId || currentInspection?.id,
            },
          }),
        });

        const result = await res.json();

        const assistantMsg: TranscriptMessage = {
          id: `asst-${Date.now()}`,
          speaker: "assistant",
          speakerName: "KitchenGuard",
          role: "Voice Agent",
          text: result.voiceResponse || `Recorded observation: "${text}".`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          badge: result.badge,
        };

        setTranscript((prev) => [...prev, assistantMsg]);

        // If an observation or correction was generated, update activeObservation
        if (result.data?.observation) {
          setActiveObservation(result.data.observation);
        }

        // Sync spatial memory into browser localStorage (Hackathon Mode)
        if (intent.toolName === "rememberObservation" && result.success) {
          const params = intent.parameters;
          LocalMemoryStore.saveMemory({
            entityName: (params.subject as string) || (params.item as string) || "Item",
            relation: (params.relation as string) || "in",
            objectName: (params.object as string) || (params.location as string) || "Kitchen",
            locationDescription: params.locationDescription as string | undefined,
            sourceText: text,
            source: "worker_voice",
            isCorrection: params.isCorrection === true || params.isCorrection === "true",
          });
        } else if (intent.toolName === "updateMemory" && result.success) {
          const params = intent.parameters;
          LocalMemoryStore.updateMemory(
            (params.entity as string) || "",
            (params.newRelation as string) || "",
            (params.newObject as string) || "",
            text
          );
        }

        // Refresh entire inspection state from database
        await refreshInspection();

        // Vocalize response back to inspector hands-free
        speakVoiceResponse(result.voiceResponse || `Recorded observation: "${text}".`);
      } catch (err) {
        console.error("[useVoiceAgent] Tool execution error:", err);
        setVoiceState("listening");
        setCurrentSpeaker("worker");
      } finally {
        setIsProcessing(false);
      }
    },
    [refreshInspection, options.inspectionId, currentInspection?.id, speakVoiceResponse]
  );

  // Connect to AssemblyAI Streaming API v3 via Browser WebSocket
  const startLiveAudio = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        return;
      }

      setVoiceState("listening");
      const session = await assemblyAIService.createSessionToken();

      if (!session.websocketUrl) {
        return;
      }

      // 1. Establish AssemblyAI Real-Time WebSocket Connection
      const socket = new WebSocket(session.websocketUrl);
      socketRef.current = socket;

      socket.onopen = async () => {
        setConnectionState("connected");

        try {
          // 2. Capture raw microphone audio stream
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          mediaStreamRef.current = stream;

          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          const audioCtx = new AudioCtx({ sampleRate: 16000 });
          audioContextRef.current = audioCtx;

          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (socket.readyState !== WebSocket.OPEN) return;
            const inputData = e.inputBuffer.getChannelData(0);

            // Calculate live audio energy level
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            if (rms > 0.04) {
              setAudioClarityScore(Math.min(99.8, 97.0 + rms * 10));
            }

            // Convert Float32 to 16-bit Mono PCM
            const pcmBuffer = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }

            // Stream PCM audio chunk directly to AssemblyAI
            socket.send(pcmBuffer.buffer);
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        } catch {
          // If mic permission denied, continue seamlessly
        }
      };

      // 3. Handle live incoming speech turns from AssemblyAI
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "Begin") {
            setConnectionState("connected");
          } else if (data.type === "Turn" && data.transcript) {
            const spokenText = data.transcript.trim();
            if (spokenText) {
              if (data.end_of_turn) {
                // Phrase complete - clear interim and execute deterministic tools
                setInterimTranscript("");
                processSpokenInspection(spokenText);
              } else {
                // Live interim words while speaking
                setInterimTranscript(spokenText);
                setVoiceState("listening");
                setCurrentSpeaker("worker");
              }
            }
          }
        } catch {}
      };

      socket.onerror = () => {
        setConnectionState("disconnected");
      };

      socket.onclose = () => {
        setConnectionState("disconnected");
      };
    } catch {
      // Fallback
    }
  }, [processSpokenInspection]);

  // Toggle mic listening status
  const toggleListening = useCallback(() => {
    setIsListening((prev) => {
      const next = !prev;
      if (!next) {
        setVoiceState("idle");
        setCurrentSpeaker(null);
        stopLiveAudio();
      } else {
        setVoiceState("listening");
        setCurrentSpeaker("worker");
        startLiveAudio();
      }
      return next;
    });
  }, [startLiveAudio, stopLiveAudio]);

  // Step through realistic dialogue flow (or reactive demo button)
  const advanceDialogueStep = useCallback(() => {
    if (stepIndexRef.current >= sampleTranscripts.length) {
      setVoiceState("complete");
      setCurrentSpeaker(null);
      return;
    }

    const nextMsg = sampleTranscripts[stepIndexRef.current];
    stepIndexRef.current += 1;

    // Execute via deterministic pipeline
    if (nextMsg.speaker === "worker") {
      processSpokenInspection(nextMsg.text);
    } else {
      setTranscript((prev) => [...prev, nextMsg]);
      speakVoiceResponse(nextMsg.text);
    }
  }, [processSpokenInspection, speakVoiceResponse]);

  // Accept current observation correction
  const acceptCorrection = useCallback(async () => {
    if (!activeObservation) return;
    setIsProcessing(true);
    setVoiceState("processing");

    try {
      await fetch("/api/tools/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: "updateObservation",
          parameters: {
            observationId: activeObservation.id,
            item: activeObservation.item,
            newValue: activeObservation.value,
            reason: "Inspector confirmed voice correction",
            inspectionId: options.inspectionId || currentInspection?.id,
          },
        }),
      });

      await refreshInspection();
    } catch (err) {
      console.error("[useVoiceAgent] Error accepting correction:", err);
    } finally {
      setIsProcessing(false);
      setVoiceState("listening");
    }
  }, [activeObservation, refreshInspection, options.inspectionId, currentInspection?.id]);

  // Keep previous value
  const rejectCorrection = useCallback(() => {
    if (!activeObservation) return;
    setActiveObservation((prev) =>
      prev
        ? {
            ...prev,
            value: prev.previousValue || prev.value,
            previousValue: undefined,
            status: "verified",
          }
        : null
    );
  }, [activeObservation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopLiveAudio();
    };
  }, [stopLiveAudio]);

  return {
    connectionState,
    voiceState,
    transcript,
    interimTranscript,
    currentSpeaker,
    isListening,
    isProcessing,
    lastToolCall,
    activeObservation,
    currentInspection,
    audioClarityScore,
    toggleListening,
    advanceDialogueStep,
    acceptCorrection,
    rejectCorrection,
    refreshInspection,
    setVoiceState,
    speakVoiceResponse,
  };
}
