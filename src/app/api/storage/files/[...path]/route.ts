import { NextRequest, NextResponse } from "next/server";
import { serverFileStorage, storageDriver } from "lib/file-storage";
import { FileNotFoundError } from "lib/errors";
import logger from "logger";

export const runtime = "nodejs";

/**
 * Serve files from local storage.
 * This route is only used when FILE_STORAGE_TYPE=local
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    // Only serve files for local storage
    if (storageDriver !== "local") {
      return NextResponse.json(
        { error: "This endpoint is only available for local storage" },
        { status: 404 },
      );
    }

    const { path } = await params;
    const key = path.join("/");

    if (!key) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 },
      );
    }

    // Get file metadata and content
    const [metadata, buffer] = await Promise.all([
      serverFileStorage.getMetadata(key),
      serverFileStorage.download(key),
    ]);

    if (!metadata) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Return file with appropriate headers
    // Convert Buffer to Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": metadata.contentType,
        "Content-Length": metadata.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${metadata.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof FileNotFoundError) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    logger.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 },
    );
  }
}
