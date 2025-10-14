"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import type { JobFormState } from "@/lib/actions/jobs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface JobFormProps {
    mode: "create" | "edit";
    postId?: string;
    initialValues?: {
        title?: string;
        description?: string;
        category?: "OFFER" | "WANTED";
        expiresAt?: string;
    };
    actionFn: (
        prevState: JobFormState,
        formData: FormData
    ) => Promise<JobFormState>;
}

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
            {pending ? "Išsaugoma..." : label}
        </button>
    );
}

export function JobForm({ mode, initialValues, actionFn }: JobFormProps) {
    const initialState: JobFormState = { ok: false };
    const [state, formAction] = useActionState(actionFn, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.ok) {
            if (mode == "create") {
                toast.success("Skelbimas sėkmingai paskelbtas");
                setTimeout(() => {
                    router.push(`/dashboard/posts/${state.newPostId}/edit`);
                }, 500);
            } else toast.success("Skelbimas atnaujintas");
        } else if (state.formError) {
            toast.error(state.formError);
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Pavadinimas</label>
                <input
                    name="title"
                    type="text"
                    defaultValue={initialValues?.title ?? ""}
                    className="mt-1 w-full border rounded p-2 text-sm"
                />
                {state.fieldErrors?.title?.[0] && (
                    <p className="text-xs text-red-600 mt-1">
                        {state.fieldErrors.title[0]}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Aprašymas</label>
                <textarea
                    name="description"
                    rows={5}
                    defaultValue={initialValues?.description ?? ""}
                    className="mt-1 w-full border rounded p-2 text-sm"
                />
                {state.fieldErrors?.description?.[0] && (
                    <p className="text-xs text-red-600 mt-1">
                        {state.fieldErrors.description[0]}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Kategorija</label>
                <select
                    name="category"
                    defaultValue={initialValues?.category ?? "OFFER"}
                    className="mt-1 w-full border rounded p-2 text-sm"
                >
                    <option value="OFFER">Siūlau darbą</option>
                    <option value="WANTED">Ieškau darbo</option>
                </select>
                {state.fieldErrors?.category?.[0] && (
                    <p className="text-xs text-red-600 mt-1">
                        {state.fieldErrors.category[0]}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium">Galioja iki</label>
                <input
                    name="expiresAt"
                    type="date"
                    defaultValue={initialValues?.expiresAt ?? ""}
                    className="mt-1 w-full border rounded p-2 text-sm"
                />
                {state.fieldErrors?.expiresAt?.[0] && (
                    <p className="text-xs text-red-600 mt-1">
                        {state.fieldErrors.expiresAt[0]}
                    </p>
                )}
            </div>

            {state.formError && (
                <p className="text-sm text-red-600">{state.formError}</p>
            )}
            {state.ok && state.message && (
                <p className="text-sm text-green-700">{state.message}</p>
            )}

            <SubmitButton label={mode === "edit" ? "Išsaugoti" : "Sukurti"} />
        </form>
    );
}
