import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const WATERMARK_PATH = path.join(process.cwd(), "public", "watermark.png");

async function ensureUploadDir() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Processes an uploaded image file:
 * - resizes to max width 800 px
 * - adds watermark scaled to 10 % of image width
 * - compresses to JPEG (quality 70)
 * - stores it under /public/uploads
 * @returns relative path like "uploads/uuid.jpg"
 */
export async function processImageUpload(file: File): Promise<string> {
    await ensureUploadDir();

    // Convert File to Buffer
    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    // Generate unique filename
    const id = uuidv4();
    const filename = `${id}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    // Read watermark file (ensure it exists)
    const watermarkBuf = await fs.readFile(WATERMARK_PATH);

    // Load main image
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const mainWidth = metadata.width ?? 800;

    // Resize watermark to 10 % of image width
    const watermarkWidth = Math.round(mainWidth * 0.2);
    const watermarkResized = await sharp(watermarkBuf)
        .resize({ width: watermarkWidth })
        .toBuffer();

    // Process main image
    await image
        .resize({ width: 800, withoutEnlargement: true })
        .composite([
            {
                input: watermarkResized,
                gravity: "southeast",
                blend: "over",
            },
        ])
        .webp({ quality: 75 })
        .toFile(outputPath);

    // Return relative public path
    return `uploads/${filename}`;
}
