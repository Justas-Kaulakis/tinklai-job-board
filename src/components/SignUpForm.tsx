"use client";

import { AuthFormState, signUpAction } from "@/lib/actions/signUp";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { toast } from "sonner";

const SignUpForm = () => {
    const router = useRouter();
    const initialState: AuthFormState = { ok: false };
    const [state, formAction] = useActionState(signUpAction, initialState);

    useEffect(() => {
        if (state.ok) {
            toast.success("Paskyra sukurta sėkmingai! Prisijunkite!");
            router.push("/sign-in");
        } else if (state.formError) {
            toast.error(state.formError);
        }
    }, [state, router]);

    return (
        <>
            <h1 className="text-2xl font-bold text-center mb-6">
                Susikurkite paskyrą
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
                    Registruotis
                </Button>
            </form>

            <div className="text-center mt-4">
                <Button asChild variant="link">
                    <Link href="/sign-in">
                        Jau turite paskyrą? Prisijunkite
                    </Link>
                </Button>
            </div>
        </>
    );
};

export default SignUpForm;
