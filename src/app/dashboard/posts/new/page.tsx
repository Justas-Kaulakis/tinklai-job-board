// app/dashboard/posts/new/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createJobAction } from "@/lib/actions/jobs";
import { JobForm } from "@/components/JobForm";

export default async function NewJobPage() {
    const session = await auth();
    const user = session?.user;

    // Ensure user is logged in and allowed to post
    if (!user) redirect("/sign-in");
    if (!user.canPost) redirect("/dashboard");

    return (
        <section className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-semibold">Naujas skelbimas</h2>
            <p className="text-sm text-gray-600">
                Užpildykite formą, kad pridėtumėte naują darbo skelbimą.
            </p>

            <JobForm mode="create" actionFn={createJobAction} />
        </section>
    );
}
