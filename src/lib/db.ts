import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL as string;

// console.log({ cwd: process.cwd(), url });

// const adapter = new PrismaBetterSQLite3({
//     url,
// });
// const prisma = new PrismaClient({ adapter });

// export default prisma;

// Singleton for Next.js (dev hot-reload safe)
const globalForPrisma = globalThis as unknown as {
    db: PrismaClient | undefined;
};

if (!globalForPrisma.db) {
    globalForPrisma.db = new PrismaClient({ datasourceUrl: url });
}
export default globalForPrisma.db as PrismaClient;
