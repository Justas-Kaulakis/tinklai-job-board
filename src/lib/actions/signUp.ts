"use server";

import bcrypt from "bcryptjs";
import db from "../db";
import { loginSchema } from "../validation";
import { executeFormAction } from "./executeFormAction";
import type { FormState } from "./formStates";
import z from "zod";
import { signIn } from "../auth";
import { revalidatePath } from "next/cache";

type AuthFields = keyof z.infer<typeof loginSchema>;
export type AuthFormState = FormState<AuthFields>;

export async function signUpAction(
    prevState: AuthFormState,
    formData: FormData
): Promise<AuthFormState> {
    return executeFormAction(formData, loginSchema, async (parsed) => {
        const existing = await db.user.findUnique({
            where: { email: parsed.email.toLowerCase() },
        });

        if (existing) throw new Error("Šis el. paštas jau registruotas.");

        const hashedPassword = await bcrypt.hash(parsed.password, 10);

        await db.user.create({
            data: {
                email: parsed.email.toLowerCase(),
                password: hashedPassword,
                canPost: true,
            },
        });
    });
}

export async function signInAction(
    prevState: AuthFormState,
    formData: FormData
): Promise<AuthFormState> {
    return executeFormAction(formData, loginSchema, async (parsed) => {
        await signIn("credentials", {
            email: parsed.email.toLocaleLowerCase(),
            password: parsed.password,
            redirect: false,
        });
        revalidatePath(`/`, "layout");
        revalidatePath(`/dashboard`, "layout");
    });
}
