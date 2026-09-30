import { NextRequest, NextResponse } from "next/server";
import { InspectionService } from "@/lib/inspection/services/inspectionService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = InspectionService.reviewInspection({ inspectionId: id });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
