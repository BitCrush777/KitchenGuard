import { NextRequest, NextResponse } from "next/server";
import { MemoryService } from "@/lib/memory/memory-service";
import { parseSpokenInspectionIntent } from "@/lib/inspection/tools/intentParser";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, text, query, entity, relation, object, temporalScope, kitchenId } = body;

    // 1. Text-based query / natural speech parser
    if (text) {
      const parsed = parseSpokenInspectionIntent(text);
      if (parsed.toolName === "locateEntity") {
        const result = MemoryService.locateEntity({
          entity: (parsed.parameters.entity as string) || "",
          temporalScope: parsed.parameters.temporalScope as "current" | "historical" | "all" | undefined,
          kitchenId,
        });
        return NextResponse.json({ success: true, toolName: parsed.toolName, result, parsed });
      }

      if (parsed.toolName === "reverseLocate") {
        const result = MemoryService.reverseLocate({
          relation: (parsed.parameters.relation as string) || "",
          object: (parsed.parameters.object as string) || "",
          kitchenId,
        });
        return NextResponse.json({ success: true, toolName: parsed.toolName, result, parsed });
      }

      if (parsed.toolName === "getMemoryHistory") {
        const result = MemoryService.getMemoryHistory({
          entity: (parsed.parameters.entity as string) || "",
          kitchenId,
        });
        return NextResponse.json({ success: true, toolName: parsed.toolName, result, parsed });
      }

      if (parsed.toolName === "rememberObservation") {
        const isCorr = parsed.parameters.isCorrection === true || parsed.parameters.isCorrection === "true";
        const result = MemoryService.rememberObservation({
          subject: (parsed.parameters.subject as string) || "",
          relation: (parsed.parameters.relation as string) || "",
          object: (parsed.parameters.object as string) || "",
          isCorrection: isCorr,
          sourceText: text,
          kitchenId,
        });
        return NextResponse.json({ success: true, toolName: parsed.toolName, result, parsed });
      }

      if (parsed.toolName === "searchMemory") {
        const result = MemoryService.searchMemory({
          query: (parsed.parameters.query as string) || text,
          kitchenId,
        });
        return NextResponse.json({ success: true, toolName: parsed.toolName, result, parsed });
      }

      return NextResponse.json({
        success: false,
        message: "No specific memory intent detected from utterance",
        parsed,
      });
    }

    // 2. Direct programmatic queries
    switch (action) {
      case "locate": {
        const result = MemoryService.locateEntity({
          entity: entity || query || "",
          temporalScope,
          kitchenId,
        });
        return NextResponse.json({ success: true, result });
      }

      case "reverse": {
        const result = MemoryService.reverseLocate({
          relation: relation || "",
          object: object || query || "",
          kitchenId,
        });
        return NextResponse.json({ success: true, result });
      }

      case "history": {
        const result = MemoryService.getMemoryHistory({
          entity: entity || query || "",
          kitchenId,
        });
        return NextResponse.json({ success: true, result });
      }

      case "search": {
        const result = MemoryService.searchMemory({
          query: query || "",
          kitchenId,
          timeRange: temporalScope,
        });
        return NextResponse.json({ success: true, result });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown query action: "${action}"` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API/Memory/Query] POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Memory query processing failed",
      },
      { status: 500 }
    );
  }
}
