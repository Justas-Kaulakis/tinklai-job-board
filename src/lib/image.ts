"use server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/** Read from env, or use defaults for dev */
const IS_PROD = process.env.NODE_ENV === "production";
const UPLOAD_ROOT =
    process.env.UPLOAD_ROOT || (IS_PROD ? "data/uploads" : "public/uploads");
const WATERMARK_PATH = process.env.WATERMARK_PATH || "public/watermark.png";
/** Absolute dir where files will be written */
const UPLOAD_DIR = path.join(process.cwd(), UPLOAD_ROOT);

async function ensureUploadDir() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
}
export async function resolveImagePath(dbPath: string): Promise<string> {
    const fileName = path.basename(dbPath);
    return path.join(UPLOAD_DIR, fileName);
}

export async function processImageUpload(file: File): Promise<string> {
    await ensureUploadDir();

    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const id = uuidv4();
    const filename = `${id}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    // Read watermark file
    const watermarkBuf = await fs.readFile(
        path.join(process.cwd(), WATERMARK_PATH)
    );

    // Step 1️⃣ Resize main image first (max width 800)
    const resizedImageBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .toBuffer();

    // Step 2️⃣ Get the final width after resizing
    const resizedMeta = await sharp(resizedImageBuffer).metadata();
    const finalWidth = resizedMeta.width ?? 800;

    // Step 3️⃣ Resize watermark to <=10% of final width (and cap it to avoid errors)
    const watermarkWidth = Math.max(1, Math.round(finalWidth * 0.2));
    const watermarkResized = await sharp(watermarkBuf)
        .resize({ width: watermarkWidth, withoutEnlargement: true })
        .toBuffer();

    // Step 4️⃣ Composite safely, then save
    await sharp(resizedImageBuffer)
        .composite([
            { input: watermarkResized, gravity: "east", blend: "over" },
        ])
        .webp({ quality: 75 })
        .toFile(outputPath);

    return `uploads/${filename}`;
}
