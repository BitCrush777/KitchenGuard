import { NextRequest, NextResponse } from "next/server";
import { InspectionService } from "@/lib/inspection/services/inspectionService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const result = InspectionService.finalizeInspection({
      ...body,
      inspectionId: id,
    });
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
