"use server";

import { auth } from "../auth";
import db from "../db";
import { revalidatePath } from "next/cache";
import { messageSchema } from "../validation";
import { executeFormAction } from "./executeFormAction";
import type { FormState } from "./formStates";
import { executeAction } from "./executeAction";

type MsgFields = "content";
type MsgState = FormState<MsgFields>;

export async function sendMessageAction(
    prevState: MsgState,
    formData: FormData
): Promise<MsgState> {
    return executeFormAction(formData, messageSchema, async (parsed) => {
        const session = await auth();
        if (!session?.user) throw new Error("Turite prisijungti.");
        await db.message.create({
            data: {
                content: parsed.content,
                postId: parsed.postId,
                senderId: session.user.id,
            },
        });

        revalidatePath(`/jobs/${parsed.postId}`);
    });
}

/**
 * User requests deletion of a message on their own post.
 */
export async function createDeletionRequest(messageId: string) {
    return executeAction({
        actionFn: async () => {
            const session = await auth();
            if (!session?.user) throw new Error("Turite prisijungti.");

            const userId = session.user.id;

            // 1️⃣ Load message + post
            const message = await db.message.findUnique({
                where: { id: messageId },
                include: { post: true },
            });

            if (!message) throw new Error("Žinutė nerasta.");

            // 2️⃣ Only post author can request
            if (message.post.authorId !== userId) {
                throw new Error("Galite žymėti tik savo skelbimo žinutes.");
            }

            // 3️⃣ Prevent duplicate requests
            const existing = await db.messageDeletionRequest.findFirst({
                where: { messageId },
            });

            if (existing) throw new Error("Ši žinutė jau pažymėta trinimui.");

            // 4️⃣ Create request
            await db.messageDeletionRequest.create({
                data: {
                    messageId,
                    requestedById: userId,
                },
            });

            revalidatePath("/dashboard");
        },
        successMessage: "Žinutė pažymėta kontrolieriui.",
    });
}

export async function deleteMessage(messageId: string) {
    return executeAction({
        actionFn: async () => {
            const session = await auth();
            if (!session?.user) throw new Error("Turite prisijungti.");

            const message = await db.message.findUnique({
                where: { id: messageId },
                // include: { post: true },
            });
            if (!message) throw new Error("Žinutė nerasta.");

            const canDelete =
                session.user.id === message.senderId ||
                session.user.role === "CONTROLLER";

            if (!canDelete)
                throw new Error("Neturite teisės ištrinti šios žinutės.");

            await db.message.delete({ where: { id: messageId } });
            revalidatePath("/dashboard");
            revalidatePath("/controller");
        },
        successMessage: "Žinutė ištrinta.",
    });
}
