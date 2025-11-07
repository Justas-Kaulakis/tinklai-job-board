"use server";

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Detect environments
// const IS_PROD = process.env.NODE_ENV === "production";
const RAILWAY_VOLUME = process.env.RAILWAY_VOLUME_MOUNT_PATH;

// Determine upload root directory
// Priority: Railway volume → local data/uploads
const UPLOAD_DIR = RAILWAY_VOLUME
    ? path.join(RAILWAY_VOLUME, "uploads")
    : path.join(process.cwd(), "data", "uploads");

// Watermark path always relative to project root
const WATERMARK_PATH = path.join(process.cwd(), "public", "watermark.png");

// Ensure directory exists
async function ensureUploadDir() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Given DB path like: "uploads/xxxx.webp"
 * Return FULL system path for deletion.
 */
export async function resolveImagePath(
    dbRelativePath: string
): Promise<string> {
    return path.join(UPLOAD_DIR, path.basename(dbRelativePath));
}

/**
 * Process + save uploaded image
 * Returns DB path like: "uploads/xxxx.webp"
 */
export async function processImageUpload(file: File): Promise<string> {
    await ensureUploadDir();

    const buffer = Buffer.from(await file.arrayBuffer());
    const watermarkBuf = await fs.readFile(WATERMARK_PATH);

    // Resize main image
    const resizedImage = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .toBuffer();

    // Get final resized width
    const meta = await sharp(resizedImage).metadata();
    const width = meta.width ?? 800;

    // Resize watermark to ~10% width
    const watermarkWidth = Math.max(1, Math.round(width * 0.1));
    const watermarkSmall = await sharp(watermarkBuf)
        .resize({ width: watermarkWidth })
        .toBuffer();

    // Generate filename + save
    const filename = `${uuidv4()}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    await sharp(resizedImage)
        .composite([
            { input: watermarkSmall, gravity: "southeast", blend: "over" },
        ])
        .webp({ quality: 75 })
        .toFile(outputPath);

    // Stored in DB — served via /api/uploads or static route
    return `uploads/${filename}`;
}
