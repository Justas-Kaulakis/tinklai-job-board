import path from "node:path";
import type { PrismaConfig } from "prisma";
// import "dotenv/config";

const db = "./src/lib/db";

console.log("seed: ", process.env.SEED);

export default {
    schema: path.join(db, "schema.prisma"),
    migrations: {
        seed: `tsx ${path.join(db, "seedLt.ts")}`,
    },
} satisfies PrismaConfig;
