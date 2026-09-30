# KitchenGuard 🛡️🍳
### Hands-Free, Voice-Native Food-Safety Inspection & Persistent Spatial Memory System

> **Built for the AssemblyAI Voice Agent Hackathon**  
> Turning natural kitchen speech into deterministic compliance decisions, verified checkpoint states, immutable issue tracking, and long-term persistent spatial memory.

---

## 🌟 Overview

**KitchenGuard** is a production-shaped, voice-first food-safety inspection system engineered for high-volume commercial kitchens. As inspectors or kitchen staff conduct walkthroughs with their hands full, they speak naturally:

> *"Walk-in refrigerator is four degrees."*  
> *"There is a blue cleaning bucket under the refrigerator."*  
> *"Actually, the refrigerator was six degrees, not four."*  
> *"Where is the blue bucket?"*  
> *"I moved the blue bucket next to the sink."*  
> *"What is under the refrigerator?"*

KitchenGuard does **not** simply display a transcript or feed raw instructions into an unconstrained LLM. It routes voice streams through an end-to-end, multi-layered architecture:

```
VOICE STREAM (Inspector Microphone)
              ↓
[AssemblyAI Streaming v3 WebSocket]
              ↓
[Deterministic Voice Intent Router]
              ↓
[Typed KitchenGuard Application Tools]
  ├── recordObservation
  ├── updateObservation (Voice Corrections)
  ├── completeCheckpoint
  ├── flagIssue / resolveIssue
  ├── rememberObservation (Spatial Memory)
  ├── locateEntity / reverseLocate
  └── getMemoryHistory (Audit Provenance)
              ↓
[Deterministic Safety Rules Engine]
  ├── Thermal limits (Cold Storage ≤ 5°C, Freezer ≤ -18°C, Dish rinse ≥ 82°C)
  ├── Chemical titration (Sanitizer 200–400 PPM)
  ├── Cross-contamination vertical rack hierarchies (Vegetables above raw poultry)
  └── Evidence completeness gates (Soap + paper towels)
              ↓
[State Machine & Atomic JSON Persistence]
  └── data/kitchenguard-db.json
              ↓
[Live Stitch UI + Magic UI Animated Indicators]
              ↓
[Concise Voice Response (Web Speech API)]
```

---

## 🚀 Key Highlights & Capabilities

### 1. Hands-Free Voice Agent Engine
- Real-time low-latency audio capture streamed directly to **AssemblyAI** via 16 kHz Mono PCM WebSockets.
- Instant vocal feedback to inspectors without taking hands off kitchen tasks.

### 2. Deterministic Application Rules Engine
- **Core Principle**: *AI interprets language. KitchenGuard determines application state.*
- Final compliance is computed deterministically using standard regulatory food-safety limits (HACCP / FDA Food Code).
- Enforces strict safety gates: inspections cannot be finalized while critical violations remain open.

### 3. Real Persistent Spatial & Factual Memory
- Authoritative, durable memory of equipment, tools, and locations tracked across sessions.
- **Strict Temporal Reasoning**: If an item moves from under the refrigerator to next to the sink:
  - Forward lookup (*"Where is the blue bucket now?"*) $\rightarrow$ *"Next to the sink."*
  - Historical lookup (*"Where was it before?"*) $\rightarrow$ *"Under the walk-in refrigerator."*
  - Reverse lookup (*"What is under the refrigerator?"*) $\rightarrow$ Strictly reports that nothing is currently recorded there!
- **Ambiguity Handling**: Automatically clarifies when multiple similar entities exist rather than guessing or hallucinating.
- **Provenance Audit Trail**: Logs every `MEMORY_CREATED`, `MEMORY_MOVED`, `MEMORY_CORRECTED`, and `MEMORY_CONFIRMED` event.

### 4. Enterprise Kitchen UI (Stitch + Magic UI)
- Built on a hospitality-grade design system with deep evergreen accents, warm ivory surfaces, and clean typography.
- Enhanced with subtle, non-intrusive Magic UI micro-interactions:
  - Interactive Voice Activity Field (idle, listening, processing, speaking states).
  - Number ticker animations for kitchen readiness metrics.
  - Dedicated **Kitchen Memory Registry** (`/memory`) page with live natural query interface.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions, API Routes)
- **Language**: TypeScript (Strict mode, zero `any` shortcuts in core services)
- **Voice Recognition**: AssemblyAI Streaming API v3 WebSocket
- **UI & Styling**: Tailwind CSS, Lucide Icons, Magic UI
- **Persistence**: Disk-backed atomic JSON store (`data/kitchenguard-db.json`)
- **Testing**: Deterministic integration test suites with `tsx`

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20+)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/BitCrush777/KitchenGuard.git
cd KitchenGuard
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your AssemblyAI API key:
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Automated Test Suites

KitchenGuard comes equipped with **106 automated tests** validating deterministic state management, food safety thresholds, and persistent spatial memory.

### Run All Memory Tests (20 Test Cases + 10-Step Mandatory Scenario)
```bash
npx tsx scripts/test-memory.ts
```
> **Result**: `60 PASSED, 0 FAILED`

### Run Food-Safety Inspection Engine Tests
```bash
npx tsx scripts/test-engine.ts
```
> **Result**: `46 PASSED, 0 FAILED`

### Run Type Checking & Linter
```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## 🗺️ Application Routes

| Path | Description |
| :--- | :--- |
| `/` | Overview Dashboard with live metrics & readiness scores |
| `/inspections` | Inspection log & historical audit records |
| `/inspections/new` | Launch new Opening, Closing, or Deep-Clean audit |
| `/inspections/live` | Hands-free live voice inspection workspace |
| `/inspections/review` | Pre-completion audit review & sign-off gate |
| `/memory` | **Kitchen Memory Registry** (Active locations & audit timeline) |
| `/issues` | Food-safety violation issue tracker & resolution center |
| `/reports` | Comprehensive compliance reports & executive summaries |
| `/rules` | Regulatory threshold configuration |

---

## 📄 License
MIT License. Built for the **AssemblyAI Voice Agent Hackathon**.
