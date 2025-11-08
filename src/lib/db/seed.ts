/*
// src/lib/db/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...");

    // 1. Clean up existing data
    // await db.message.deleteMany();
    // await db.jobPost.deleteMany();
    // await db.user.deleteMany();

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

  */

/**
 * prisma/seed.ts
 * Populates the SQLite database with sample users, posts, and messages.
 *
 * Run with:  npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const db = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // --- Clean up previous data ---
    await db.message.deleteMany();
    await db.jobPost.deleteMany();
    await db.user.deleteMany();

    // --- Create roles ---
    const adminPassword = await bcrypt.hash("admin123", 10);
    const controllerPassword = await bcrypt.hash("controller123", 10);

    const admin = await db.user.create({
        data: {
            name: "Admin Jonas",
            email: "admin@example.com",
            password: adminPassword,
            role: "ADMIN",
            canPost: true,
        },
    });

    const controller = await db.user.create({
        data: {
            name: "Kontrolierius Petras",
            email: "controller@example.com",
            password: controllerPassword,
            role: "CONTROLLER",
            canPost: false,
        },
    });

    console.log("✅ Admin and Controller created");

    // --- Create 15 random client users ---
    const clientUsers = await Promise.all(
        Array.from({ length: 15 }).map(async () => {
            const password = await bcrypt.hash("client123", 10);
            return db.user.create({
                data: {
                    name: faker.person.fullName(),
                    email: faker.internet
                        .email({ provider: "example.com" })
                        .toLocaleLowerCase(),
                    password,
                    role: "CLIENT",
                    canPost: Math.random() < 0.7, // 70% of clients can post
                },
            });
        })
    );

    console.log(`✅ Created ${clientUsers.length} client users`);

    // --- Create job posts ---
    const now = new Date();
    const jobPosts = [];

    for (const user of clientUsers.filter((u) => u.canPost)) {
        const postCount = faker.number.int({ min: 1, max: 4 });

        for (let i = 0; i < postCount; i++) {
            const category = faker.helpers.arrayElement(["OFFER", "WANTED"]);
            const expiresAt = faker.date.soon({
                days: faker.number.int({ min: 7, max: 60 }),
                refDate: now,
            });

            const post = await db.jobPost.create({
                data: {
                    title:
                        category === "OFFER"
                            ? faker.person.jobTitle()
                            : `${faker.person.jobType()} norėčiau dirbti`,
                    description: faker.lorem.paragraphs(2),
                    category,
                    expiresAt,
                    authorId: user.id,
                    views: faker.number.int({ min: 0, max: 300 }),
                },
            });

            jobPosts.push(post);
        }
    }

    console.log(`✅ Created ${jobPosts.length} job posts`);

    // --- Create random messages ---
    const allUsers = [admin, controller, ...clientUsers];
    let totalMessages = 0;

    for (const post of jobPosts) {
        const messageCount = faker.number.int({ min: 0, max: 6 });
        for (let i = 0; i < messageCount; i++) {
            const sender = faker.helpers.arrayElement(
                allUsers.filter((u) => u.id !== post.authorId)
            );

            await db.message.create({
                data: {
                    content: faker.lorem.sentences({ min: 1, max: 3 }),
                    postId: post.id,
                    senderId: sender.id,
                },
            });

            totalMessages++;
        }
    }

    console.log(`✅ Created ${totalMessages} messages`);

    console.log("🌟 Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
