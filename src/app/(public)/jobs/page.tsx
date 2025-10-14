// app/(public)/jobs/page.tsx
import db from "@/lib/db";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";

type JobsPageProps = {
    searchParams: Promise<{ category?: string }>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
    const cat = (await searchParams).category;
    const category =
        cat === "WANTED" ? "WANTED" : cat === "OFFER" ? "OFFER" : undefined;

    const posts = await db.jobPost.findMany({
        where: {
            expiresAt: { gt: new Date() },
            ...(category ? { category } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: { author: true },
    });

    return (
        <section className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-semibold">Skelbimai</h1>

                <div className="flex gap-2 text-sm">
                    <Link
                        href="/jobs"
                        className={`px-3 py-1 rounded border ${
                            !category
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                        Visi
                    </Link>
                    <Link
                        href="/jobs?category=OFFER"
                        className={`px-3 py-1 rounded border ${
                            category === "OFFER"
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                        Siūlau darbą
                    </Link>
                    <Link
                        href="/jobs?category=WANTED"
                        className={`px-3 py-1 rounded border ${
                            category === "WANTED"
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                        Ieškau darbo
                    </Link>
                </div>
            </header>

            {posts.length === 0 ? (
                <p className="text-gray-500">Nerasta jokių skelbimų.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((p) => (
                        <JobCard
                            key={p.id}
                            id={p.id}
                            title={p.title}
                            description={p.description}
                            category={p.category}
                            authorName={p.author?.name}
                            views={p.views}
                            expiresAt={p.expiresAt}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
