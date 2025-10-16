// app/(public)/page.tsx
import db from "@/lib/db";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
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

    const session = await auth();
    const userId = session?.user.id;
    const isController = session?.user.role === "CONTROLLER";

    return (
        <div className="space-y-6">
            <header className="text-center mt-6">
                <h1 className="text-2xl font-semibold mb-2">
                    Darbo pasiūlymų ir paieškų lenta
                </h1>
                <p className="text-gray-600">
                    Rask darbą arba pasiūlyk savo paslaugas lengvai
                </p>
            </header>
            <section>
                <div className="flex justify-center gap-2 text-sm">
                    <Link
                        href="/"
                        className={`px-3 py-1 rounded border ${
                            !category
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                        Visi
                    </Link>
                    <Link
                        href="/?category=OFFER"
                        className={`px-3 py-1 rounded border ${
                            category === "OFFER"
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                        Siūlau darbą
                    </Link>
                    <Link
                        href="/?category=WANTED"
                        className={`px-3 py-1 rounded border ${
                            category === "WANTED"
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100"
                        }`}
                    >
                        Ieškau darbo
                    </Link>
                </div>
                {posts.length === 0 ? (
                    <p className="text-gray-500">Nerasta jokių skelbimų.</p>
                ) : (
                    <div className="mx-auto max-w-6xl pt-4 grid gap-6 md:grid-cols-2 mx-2">
                        {posts.map((p) => (
                            <JobCard
                                key={p.id}
                                id={p.id}
                                title={p.title}
                                description={p.description}
                                category={p.category}
                                authorName={p.author?.name}
                                views={
                                    userId === p.authorId || isController
                                        ? p.views
                                        : undefined
                                }
                                expiresAt={p.expiresAt}
                                image={p.image}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
