"use server";

import db from "../db";
import { revalidatePath } from "next/cache";
import { executeAction } from "./executeAction";

export async function toggleCanPost(userId: string) {
    return executeAction({
        actionFn: async () => {
            const user = await db.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error("Vartotojas nerastas");

            await db.user.update({
                where: { id: userId },
                data: { canPost: !user.canPost },
            });

            revalidatePath("/admin");
        },
        successMessage: "Teisės sėkmingai atnaujintos.",
    });
}

export async function updateUserRole(userId: string, role: string) {
    return executeAction({
        actionFn: async () => {
            await db.user.update({
                where: { id: userId },
                data: { role },
            });
            revalidatePath("/admin");
        },
        successMessage: "Rolė atnaujinta sėkmingai.",
    });
}
