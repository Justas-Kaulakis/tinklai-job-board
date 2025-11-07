import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const RAILWAY_VOLUME = process.env.RAILWAY_VOLUME_MOUNT_PATH;
const UPLOAD_ROOT = RAILWAY_VOLUME
    ? path.join(RAILWAY_VOLUME, "uploads")
    : path.join(process.cwd(), "data", "uploads");

export async function GET(
    req: Request,
    { params }: { params: { filename: string } }
) {
    const filePath = path.join(UPLOAD_ROOT, params.filename);

    try {
        const file = await fs.readFile(filePath);
        return new NextResponse(
            file as any, // eslint-disable-line @typescript-eslint/no-explicit-any
            {
                headers: { "Content-Type": "image/webp" },
            }
        );
    } catch {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}
