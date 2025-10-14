"use client";

import { AuthFormState, signInAction } from "@/lib/actions/signUp";
import { useActionState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const SignInForm = () => {
    const initialState: AuthFormState = { ok: false };
    const [state, formAction] = useActionState(signInAction, initialState);
    const router = useRouter();

    const params = useSearchParams();
    const callbackUrl = params.get("callbackUrl") || "/dashboard";

    useEffect(() => {
        if (state.ok) {
            toast.success("Prisijungėte sėkmingai!");
            setTimeout(() => {
                window.location.assign(callbackUrl);
            }, 100);
        } else if (state.formError) {
            toast.error(state.formError);
        }
    }, [state, router, callbackUrl]);

    return (
        <>
            <h1 className="text-2xl font-bold text-center mb-6">
                Prisijunkite
            </h1>
            <form action={formAction} className="space-y-4">
                <div>
                    <Input
                        name="email"
                        placeholder="El. paštas"
                        type="email"
                        required
                    />
                    {state.fieldErrors?.email?.[0] && (
                        <p className="text-xs text-red-600 mt-1">
                            {state.fieldErrors.email[0]}
                        </p>
                    )}
                </div>

                <div>
                    <Input
                        name="password"
                        placeholder="Slaptažodis"
                        type="password"
                        required
                    />
                    {state.fieldErrors?.password?.[0] && (
                        <p className="text-xs text-red-600 mt-1">
                            {state.fieldErrors.password[0]}
                        </p>
                    )}
                </div>

                {state.formError && (
                    <p className="text-sm text-red-600">{state.formError}</p>
                )}

                <Button className="w-full" type="submit">
                    Prisijungti
                </Button>
            </form>

            <div className="text-center mt-4">
                <Button asChild variant="link">
                    <Link href="/sign-up">
                        Neturite paskyros? Registruokitės
                    </Link>
                </Button>
            </div>
        </>
    );
};

export default SignInForm;
