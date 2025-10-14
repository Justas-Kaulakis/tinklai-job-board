"use server";

import { z } from "zod";
import type { FormState } from "./formStates";
import { CredentialsSignin } from "next-auth";
/**
 * A generic wrapper for FormData + Zod validated actions.
 */
export async function executeFormAction<
    TSchema extends z.ZodTypeAny,
    TFields extends string = string
>(
    formData: FormData,
    schema: TSchema,
    handler: (parsed: z.infer<TSchema>) => Promise<void>
): Promise<FormState<TFields>> {
    try {
        const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

        if (!parsed.success) {
            const { formErrors, fieldErrors } = z.flattenError(parsed.error);
            return {
                ok: false,
                formError: formErrors[0] ?? "Patikrinkite formos laukus.",
                fieldErrors: fieldErrors as unknown as Record<
                    TFields,
                    string[]
                >, // here
            };
        }

        await handler(parsed.data);
        return { ok: true, message: "Veiksmas sėkmingas!" };
    } catch (error: any) {
        console.error("❌ Form action error:", error);
        if (error instanceof CredentialsSignin)
            return {
                ok: false,
                formError: "Neteisingas el. paštas arba slaptažodis",
            };
        return {
            ok: false,
            formError:
                error instanceof Error && error.message
                    ? error.message
                    : "Įvyko nenumatyta klaida.",
        };
    }
}
