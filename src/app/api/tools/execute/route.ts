import { NextRequest, NextResponse } from "next/server";
import { executeInspectionTool } from "@/lib/inspection/tools/toolExecutor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { toolName, parameters } = body;

    if (!toolName) {
      return NextResponse.json(
        { success: false, error: "Missing 'toolName' parameter" },
        { status: 400 }
      );
    }

    const result = await executeInspectionTool({
      toolName,
      parameters: parameters || {},
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
