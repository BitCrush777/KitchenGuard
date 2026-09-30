import { NextResponse } from "next/server";

export async function POST() {
  return handleTokenRequest();
}

export async function GET() {
  return handleTokenRequest();
}

async function handleTokenRequest() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      token: "demo-local-session-token",
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      mode: "simulation",
      message: "Set ASSEMBLYAI_API_KEY in your environment for live audio streaming.",
    });
  }

  try {
    const response = await fetch(
      "https://streaming.assemblyai.com/v3/token?expires_in_seconds=600",
      {
        method: "GET",
        headers: {
          Authorization: apiKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `AssemblyAI token request failed: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      token: data.token,
      expires_in_seconds: data.expires_in_seconds,
      mode: "live",
      websocketUrl: `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&token=${data.token}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to obtain AssemblyAI token" },
      { status: 500 }
    );
  }
}
