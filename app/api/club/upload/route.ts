import { NextRequest, NextResponse } from "next/server";
import { uploadClubScreenshot, MCPError } from "@/lib/mcp-client";

const MAX_FILE_SIZE = Number(process.env.UPLOAD_MAX_FILE_SIZE ?? 10_485_760);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "Screenshot file is required." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: `File too large. Maximum upload size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB.` },
        { status: 413 }
      );
    }

    const metadata: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "file") continue;
      if (typeof value === "string") {
        metadata[key] = value;
      }
    }

    const response = await uploadClubScreenshot({
      file,
      filename: file.name,
      metadata,
    });

    return NextResponse.json(
      {
        ...response,
        message: response.message ?? "Screenshot queued for analysis.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof MCPError) {
      console.warn("[api/club/upload] MCP error", error.status, error.message);
      return NextResponse.json(
        { message: error.message, details: error.details },
        { status: error.status ?? 502 }
      );
    }

    console.error("[api/club/upload] unexpected error", error);
    return NextResponse.json({ message: "Failed to upload screenshot." }, { status: 500 });
  }
}
