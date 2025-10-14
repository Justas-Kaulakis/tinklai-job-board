import SignInForm from "@/components/SignInForm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
    const session = await auth();
    if (session) redirect("/");

    return <SignInForm />;
}
