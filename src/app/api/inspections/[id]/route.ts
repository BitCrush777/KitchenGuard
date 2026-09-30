import { NextRequest, NextResponse } from "next/server";
import { getInspectionById, updateInspection } from "@/lib/inspection/persistence/database";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inspection = getInspectionById(id);
    if (!inspection) {
      return NextResponse.json({ success: false, error: "Inspection not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, inspection });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateInspection(id, (prev) => ({
      ...prev,
      ...body,
      id: prev.id, // preserve immutable ID
    }));

    if (!updated) {
      return NextResponse.json({ success: false, error: "Inspection not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, inspection: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
