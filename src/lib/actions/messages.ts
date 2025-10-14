"use server";

import { auth } from "../auth";
import db from "../db";
import { revalidatePath } from "next/cache";
import { messageSchema } from "../validation";
import { executeFormAction } from "./executeFormAction";
import type { FormState } from "./formStates";

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
