import { NextRequest, NextResponse } from "next/server";
import { getInspections } from "@/lib/inspection/persistence/database";
import { InspectionService } from "@/lib/inspection/services/inspectionService";

export async function GET() {
  try {
    const inspections = getInspections();
    return NextResponse.json({ success: true, inspections });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = InspectionService.startInspection(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
