import z from "zod";

export const loginSchema = z.object({
    email: z.email("Netinkamas el. pašto formatas"),
    password: z.string().min(1, "Slaptažodis būtinas"),
});

export const messageSchema = z.object({
    postId: z.string().min(1, "Trūksta skelbimo ID."),
    content: z
        .string()
        .trim()
        .min(1, "Žinutė privaloma.")
        .max(1000, "Per ilga žinutė."),
});

// ---------------------------
// 🧩 Validation schema
// ---------------------------
export const JOB_CATEGORIES = ["OFFER", "WANTED"] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const jobSchema = z.object({
    title: z
        .string()
        .min(3, "Pavadinimas per trumpas")
        .max(100, "Pavadinimas per ilgas"),
    description: z
        .string()
        .min(10, "Aprašymas per trumpas")
        .max(2000, "Aprašymas per ilgas"),
    category: z.union([z.literal("OFFER"), z.literal("WANTED")], {
        error: "Pasirinkite kategoriją",
    }),
    expiresAt: z.string().refine(
        (val) => {
            const date = new Date(val);
            return !isNaN(date.getTime()) && date > new Date();
        },
        { message: "Nurodykite galiojančią ateities datą" }
    ),
});
