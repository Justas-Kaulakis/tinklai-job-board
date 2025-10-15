"use server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const WATERMARK_PATH = path.join(process.cwd(), "public", "watermark.png");

async function ensureUploadDir() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function processImageUpload(file: File): Promise<string> {
    await ensureUploadDir();

    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const id = uuidv4();
    const filename = `${id}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    const watermarkBuf = await fs.readFile(WATERMARK_PATH);

    // Step 1: resize main image first
    const resizedBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .toBuffer();

    // Step 2: get actual resized width
    const resizedMeta = await sharp(resizedBuffer).metadata();
    const mainWidth = resizedMeta.width ?? 800;

    // Step 3: prepare watermark smaller than resized image
    const watermarkWidth = Math.min(
        Math.round(mainWidth * 0.2),
        mainWidth - 10
    );
    const watermarkResized = await sharp(watermarkBuf)
        .resize({ width: watermarkWidth })
        .toBuffer();

    // Step 4: composite watermark and save
    await sharp(resizedBuffer)
        .composite([
            { input: watermarkResized, gravity: "east", blend: "over" },
        ])
        .webp({ quality: 75 })
        .toFile(outputPath);

    return `uploads/${filename}`;
}
