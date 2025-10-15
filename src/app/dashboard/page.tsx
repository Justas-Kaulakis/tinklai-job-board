// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteJob } from "@/lib/actions/jobs";
import JobTypeTag from "@/components/JobTypeTag";

export default async function DashboardPage() {
    const session = await auth();
    const user = session?.user;
    if (!user) return notFound();

    // --- Gather stats and posts ---
    const [totalPosts, activePosts, receivedMessages, posts] =
        await Promise.all([
            db.jobPost.count({ where: { authorId: user.id } }),
            db.jobPost.count({
                where: { authorId: user.id, expiresAt: { gt: new Date() } },
            }),
            db.message.count({
                where: { post: { authorId: user.id } },
            }),
            db.jobPost.findMany({
                where: { authorId: user.id },
                orderBy: { createdAt: "desc" },
            }),
        ]);

    return (
        <section className="space-y-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Sveiki, {user.name ?? "naudotojau"} 👋
                    </h2>
                    <p className="text-sm text-gray-600">
                        Čia galite stebėti savo skelbimų veiklą ir žinutes.
                    </p>
                </div>

                {user.canPost ? (
                    <Link
                        href="/dashboard/posts/new"
                        className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                        + Naujas skelbimas
                    </Link>
                ) : (
                    <p className="mt-4 sm:mt-0 px-4 py-2 bg-red-100 rounded text-red-600 text-sm">
                        Skelbti negalite
                    </p>
                )}
            </header>

            {/* Overview stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-gray-500 text-sm">Viso skelbimų</h3>
                    <p className="text-2xl font-semibold">{totalPosts}</p>
                </div>

                <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-gray-500 text-sm">Aktyvūs skelbimai</h3>
                    <p className="text-2xl font-semibold">{activePosts}</p>
                </div>

                <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-gray-500 text-sm">Gautos žinutės</h3>
                    <p className="text-2xl font-semibold">{receivedMessages}</p>
                </div>
            </div>

            {/* Post list */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium mt-6 border-b pb-2">
                    Mano skelbimai
                </h3>

                {posts.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        Jūs dar nesate paskelbę jokių skelbimų.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {posts.map((post) => (
                            <li
                                key={post.id}
                                className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <h3 className="font-medium">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        galioja iki{" "}
                                        {new Date(
                                            post.expiresAt
                                        ).toLocaleDateString("lt-LT")}
                                    </p>
                                    <JobTypeTag category={post.category} />
                                    <p className="text-xs text-gray-400 pl-2 inline">
                                        Peržiūros: {post.views ?? 0}
                                    </p>
                                </div>

                                <div className="mt-3 sm:mt-0 flex items-center gap-2">
                                    <Link
                                        href={`/jobs/${post.id}`}
                                        className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                                    >
                                        Peržiūrėti
                                    </Link>
                                    <Link
                                        href={`/dashboard/posts/${post.id}/edit`}
                                        className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                                    >
                                        Redaguoti
                                    </Link>
                                    <form
                                        action={async () => {
                                            "use server";
                                            await deleteJob(post.id);
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            className="text-sm px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50"
                                        >
                                            Ištrinti
                                        </button>
                                    </form>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
