"use server";

import db from "../db";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";
import { executeAction } from "./executeAction";
import { executeFormAction } from "./executeFormAction";
import { z } from "zod";
import type { FormState } from "./formStates";
import { jobSchema } from "../validation";

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
    prevState: JobFormState,
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

            newPost = await db.jobPost.create({
                data: {
                    title: parsed.title,
                    description: parsed.description,
                    category: parsed.category,
                    expiresAt: new Date(parsed.expiresAt),
                    authorId: session.user.id,
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
    prevState: JobFormState,
    formData: FormData
): Promise<JobFormState> {
    return executeFormAction(formData, jobSchema, async (parsed) => {
        const session = await auth();
        if (!session?.user) throw new Error("Turite prisijungti.");

        const post = await db.jobPost.findUnique({ where: { id: postId } });
        if (!post) throw new Error("Skelbimas nerastas.");
        if (post.authorId !== session.user.id && session.user.role !== "ADMIN")
            throw new Error("Neturite teisės redaguoti šio skelbimo.");

        await db.jobPost.update({
            where: { id: postId },
            data: {
                title: parsed.title,
                description: parsed.description,
                category: parsed.category,
                expiresAt: new Date(parsed.expiresAt),
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
