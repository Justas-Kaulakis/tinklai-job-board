import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import seedData from "./seedData.json";

const db = new PrismaClient();

async function main() {
    console.log("❌ Deleting...");

    // --- Clean up previous data ---
    await db.message.deleteMany();
    await db.jobPost.deleteMany();
    await db.user.deleteMany();

    console.log("🌱 Seeding...");

    const passwordHash = await bcrypt.hash("test123", 10);

    // Create users
    for (const u of seedData.users) {
        await db.user.create({
            data: {
                name: u.name,
                email: u.email,
                role: u.role,
                canPost: u.canPost,
                password: passwordHash,
            },
        });
    }

    console.log("✅ Users created");

    // Create posts
    for (const p of seedData.posts) {
        const author = await db.user.findUnique({
            where: { email: p.authorEmail },
        });

        await db.jobPost.create({
            data: {
                title: p.title,
                description: p.description,
                category: p.category,
                expiresAt: new Date(Date.now() + p.expiresInDays * 86400000),
                authorId: author!.id,
            },
        });
    }

    console.log("✅ Posts created");

    // Create messages
    for (const m of seedData.messages) {
        const post = await db.jobPost.findFirst({
            where: { title: m.postTitle },
        });
        const sender = await db.user.findUnique({
            where: { email: m.senderEmail },
        });

        await db.message.create({
            data: {
                content: m.content,
                senderId: sender!.id,
                postId: post!.id,
            },
        });
    }

    console.log("✅ Messages created");
    console.log("🌿 Seeding complete!");
}

main().finally(() => db.$disconnect());
