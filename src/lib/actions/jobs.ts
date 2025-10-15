"use server";

import db from "../db";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";
import { executeAction } from "./executeAction";
import { executeFormAction } from "./executeFormAction";
import { z } from "zod";
import type { FormState } from "./formStates";
import { jobSchema } from "../validation";
import { processImageUpload } from "../image";
import fs from "fs/promises";
import path from "path";

// ---------------------------
// 🧩 Form-based actions
// ---------------------------

// Type aliases for clarity
type JobFields = keyof z.infer<typeof jobSchema>;
export type JobFormState = FormState<JobFields> & {
    newPostId?: string;
};

/**
 * Create a new job post
 */
export async function createJobAction(
    _prevState: JobFormState,
    formData: FormData
): Promise<JobFormState> {
    let newPost: any;
    const result = await executeFormAction(
        formData,
        jobSchema,
        async (parsed) => {
            const session = await auth();
            if (!session?.user) throw new Error("Turite prisijungti.");
            if (!session.user.canPost)
                throw new Error("Neturite teisės kurti skelbimų.");

            let imagePath: string | undefined = undefined;
            const file = formData.get("image");
            if (file && file instanceof File && file.size > 0) {
                imagePath = await processImageUpload(file);
            }

            newPost = await db.jobPost.create({
                data: {
                    title: parsed.title,
                    description: parsed.description,
                    category: parsed.category,
                    expiresAt: new Date(parsed.expiresAt),
                    authorId: session.user.id,
                    image: imagePath,
                },
            });

            // Revalidate list and dashboard
            revalidatePath("/jobs");
            revalidatePath("/dashboard/posts");
        }
    );
    if (result.ok && newPost.id)
        return {
            ...result,
            newPostId: newPost.id,
        };
    else return result;
}

/**
 * Update existing job post
 */
export async function updateJobAction(
    postId: string,
    _prevState: JobFormState,
    formData: FormData
): Promise<JobFormState> {
    return executeFormAction(formData, jobSchema, async (parsed) => {
        const session = await auth();
        if (!session?.user) throw new Error("Turite prisijungti.");

        const existing = await db.jobPost.findUnique({
            where: { id: postId },
            select: { authorId: true, image: true },
        });
        if (!existing) throw new Error("Skelbimas nerastas.");
        if (
            existing.authorId !== session.user.id &&
            session.user.role !== "ADMIN"
        )
            throw new Error("Neturite teisės redaguoti šio skelbimo.");

        let imagePath = existing.image; // keep old by default
        const file = formData.get("image");

        // 1. New file uploaded → replace image
        if (file && file instanceof File && file.size > 0) {
            if (existing.image) {
                try {
                    await fs.unlink(
                        path.join(process.cwd(), "public", existing.image)
                    );
                } catch {
                    console.warn("Old image not found for deletion");
                }
            }
            imagePath = await processImageUpload(file);
        }

        // 🟠 2. Optional “remove” flag → clear image
        const removeImage = formData.get("removeImage") === "true";
        if (removeImage && existing.image) {
            try {
                await fs.unlink(
                    path.join(process.cwd(), "public", existing.image)
                );
            } catch {
                console.warn("Could not remove image file");
            }
            imagePath = null;
        }

        await db.jobPost.update({
            where: { id: postId },
            data: {
                title: parsed.title,
                description: parsed.description,
                category: parsed.category,
                expiresAt: new Date(parsed.expiresAt),
                image: imagePath,
            },
        });

        revalidatePath(`/jobs/${postId}`);
        revalidatePath("/dashboard/posts");
    });
}

// ---------------------------
// 🧩 Generic (non-form) actions
// ---------------------------

/**
 * Delete a job post by ID
 */
export async function deleteJob(postId: string) {
    return executeAction({
        actionFn: async () => {
            const session = await auth();
            if (!session?.user) throw new Error("Turite prisijungti.");

            const post = await db.jobPost.findUnique({ where: { id: postId } });
            if (!post) throw new Error("Skelbimas nerastas.");
            if (
                post.authorId !== session.user.id &&
                session.user.role !== "ADMIN"
            )
                throw new Error("Neturite teisės ištrinti šio skelbimo.");

            await db.jobPost.delete({ where: { id: postId } });

            revalidatePath("/jobs");
            revalidatePath("/dashboard/posts");
        },
        successMessage: "Skelbimas ištrintas sėkmingai.",
    });
}
