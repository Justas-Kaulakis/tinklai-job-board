import path from "node:path";
import type { PrismaConfig } from "prisma";

const db = path.join("src", "lib", "db");

export default {
    schema: path.join(db, "schema.prisma"),
    migrations: {
        seed: `tsx ${path.join(db, "seed.ts")}`,
    },
} satisfies PrismaConfig;
