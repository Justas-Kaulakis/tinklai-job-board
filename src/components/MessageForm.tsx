"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/actions/formStates";
import { sendMessageAction } from "@/lib/actions/messages";
import { toast } from "sonner";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
            {pending ? "Siunčiama..." : "Siųsti žinutę"}
        </button>
    );
}

export function MessageForm({ postId }: { postId: string }) {
    const initialState: FormState<"content"> = { ok: false };
    const [state, formAction] = useActionState(sendMessageAction, initialState);
    useEffect(() => {
        if (state.ok) {
            toast.success("Komentaras išsiųstas!");
        } else if (state.formError) {
            toast.error(state.formError);
        }
    }, [state]);

    return (
        <form action={formAction} className="mt-4 space-y-3">
            <input type="hidden" name="postId" value={postId} />

            <div className="space-y-1">
                <textarea
                    name="content"
                    placeholder="Jūsų žinutė..."
                    className="w-full border rounded p-2 text-sm"
                    rows={3}
                />
                {state.fieldErrors?.content?.[0] && (
                    <p className="text-xs text-red-600">
                        {state.fieldErrors.content[0]}
                    </p>
                )}
            </div>

            {state.formError && (
                <p className="text-sm text-red-600">{state.formError}</p>
            )}
            {state.ok && state.message && (
                <p className="text-sm text-green-700">{state.message}</p>
            )}

            <SubmitButton />
        </form>
    );
}
