// src/lib/db/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...");

    // 1. Clean up existing data
    await db.message.deleteMany();
    await db.jobPost.deleteMany();
    await db.user.deleteMany();

    // 2. Create users
    const passwordHash = await bcrypt.hash("test123", 10);

    const admin = await db.user.create({
        data: {
            name: "Admin User",
            email: "admin@example.com",
            password: passwordHash,
            role: "ADMIN",
            canPost: true,
        },
    });

    const controller = await db.user.create({
        data: {
            name: "Controller User",
            email: "controller@example.com",
            password: passwordHash,
            role: "CONTROLLER",
            canPost: false,
        },
    });

    const client1 = await db.user.create({
        data: {
            name: "Jonas",
            email: "jonas@example.com",
            password: passwordHash,
            role: "CLIENT",
            canPost: true,
        },
    });

    const client2 = await db.user.create({
        data: {
            name: "Asta",
            email: "asta@example.com",
            password: passwordHash,
            role: "CLIENT",
            canPost: true,
        },
    });

    console.log("✅ Created users:", { admin, controller, client1, client2 });

    // 3. Create some posts
    const offerPost = await db.jobPost.create({
        data: {
            title: "Ieškomas React programuotojas",
            description:
                "Reikalingas React programuotojas, turintis patirties su Next.js projektais. Siūlome lankstų grafiką.",
            category: "OFFER",
            image: null,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            authorId: client1.id,
            views: 3,
        },
    });

    const wantedPost = await db.jobPost.create({
        data: {
            title: "Ieškau darbo kaip Python programuotojas",
            description:
                "Turiu 2 metų patirtį dirbant su Django ir FastAPI. Norėčiau prisijungti prie startuolio ar mažos įmonės.",
            category: "WANTED",
            image: null,
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            authorId: client2.id,
            views: 5,
        },
    });

    console.log("✅ Created posts:", { offerPost, wantedPost });

    // 4. Create some messages
    const msg1 = await db.message.create({
        data: {
            content:
                "Sveiki, domina šis pasiūlymas! Gal galėtume susisiekti el. paštu?",
            senderId: client2.id,
            postId: offerPost.id,
        },
    });

    const msg2 = await db.message.create({
        data: {
            content: "Ačiū už susidomėjimą! Galime susisiekti per LinkedIn.",
            senderId: client1.id,
            postId: offerPost.id,
        },
    });

    const msg3 = await db.message.create({
        data: {
            content: "Labas, galbūt domina mūsų įmonės Python projektas?",
            senderId: client1.id,
            postId: wantedPost.id,
        },
    });

    console.log("✅ Created messages:", { msg1, msg2, msg3 });

    console.log("🌿 Seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
