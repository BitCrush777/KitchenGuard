import { NextRequest, NextResponse } from "next/server";
import { MemoryService } from "@/lib/memory/memory-service";
import {
  getMemoryEntities,
  getMemoryRelations,
  getMemoryFacts,
  getMemoryEvents,
} from "@/lib/inspection/persistence/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kitchenId = searchParams.get("kitchenId") || "kitch-1";

    const entities = getMemoryEntities(kitchenId);
    const relations = getMemoryRelations(kitchenId);
    const facts = getMemoryFacts(kitchenId);
    const events = getMemoryEvents(kitchenId);

    const currentRelations = relations.filter((r) => r.isCurrent);
    const historicalRelations = relations.filter((r) => !r.isCurrent);

    return NextResponse.json({
      success: true,
      data: {
        entities,
        relations,
        facts,
        events,
        stats: {
          totalEntities: entities.length,
          activeLocations: currentRelations.length,
          historicalLocations: historicalRelations.length,
          auditEvents: events.length,
        },
      },
    });
  } catch (error) {
    console.error("[API/Memory] GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch kitchen memory",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = MemoryService.rememberObservation(body);

    return NextResponse.json({
      success: result.success,
      data: result,
      voiceResponse: result.voiceResponse,
    });
  } catch (error) {
    console.error("[API/Memory] POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to record observation memory",
      },
      { status: 500 }
    );
  }
}
