// app/(public)/page.tsx
import db from "@/lib/db";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";

export default async function HomePage() {
    const posts = await db.jobPost.findMany({
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { author: true },
    });

    return (
        <section className="space-y-6">
            <header className="text-center mt-6">
                <h1 className="text-2xl font-semibold mb-2">
                    Darbo pasiūlymų ir paieškų lenta
                </h1>
                <p className="text-gray-600">
                    Rask darbą arba pasiūlyk savo paslaugas lengvai
                </p>
            </header>

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

            <div className="text-center">
                <Link
                    href="/jobs"
                    className="inline-block mt-4 text-blue-600 underline underline-offset-2"
                >
                    Žiūrėti visus skelbimus →
                </Link>
            </div>
        </section>
    );
}
