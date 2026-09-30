import { NextRequest, NextResponse } from "next/server";
import { getRuleConfig, updateRuleConfig } from "@/lib/inspection/rules/config";

export async function GET() {
  return NextResponse.json({ success: true, config: getRuleConfig() });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateRuleConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
