// app/dashboard/posts/[id]/edit/page.tsx
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { updateJobAction } from "@/lib/actions/jobs";
import { JobForm } from "@/components/JobForm";

interface EditJobPageProps {
    params: Promise<{ id: string }>;
}

export const runtime = "nodejs";

export default async function EditJobPage({ params }: EditJobPageProps) {
    const session = await auth();
    const user = session?.user;
    if (!user) redirect("/sign-in");
    const postId = (await params).id;
    const post = await db.jobPost.findUnique({
        where: { id: postId },
        select: {
            id: true,
            title: true,
            description: true,
            category: true,
            expiresAt: true,
            authorId: true,
            image: true,
        },
    });

    if (!post) return notFound();

    // Authorization: only author or admin can edit
    if (post.authorId !== user.id && user.role !== "ADMIN") {
        redirect("/dashboard/posts");
    }

    console.log("DATABASE_URL: ", process.env.DATABASE_URL);
    console.log("AUTH_TRUST_HOST: ", process.env.AUTH_TRUST_HOST);
    console.log("AUTH_SECRET: ", process.env.AUTH_SECRET);
    console.log("UPLOAD_ROOT: ", process.env.UPLOAD_ROOT);

    return (
        <section className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-semibold">Redaguoti skelbimą</h2>

            <JobForm
                mode="edit"
                postId={post.id}
                initialValues={{
                    title: post.title,
                    description: post.description,
                    category: post.category as "OFFER" | "WANTED",
                    expiresAt: post.expiresAt.toISOString().split("T")[0],
                    image: post.image,
                }}
                actionFn={async (prevState, formData) => {
                    "use server";
                    console.log(
                        "posts/[id]/edit runtime:",
                        process.env.NEXT_RUNTIME
                    );
                    return updateJobAction(post.id, prevState, formData);
                }}
            />
        </section>
    );
}
