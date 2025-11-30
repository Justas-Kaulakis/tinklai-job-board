import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { MessageForm } from "@/components/MessageForm";
import { formatDistanceToNow } from "date-fns";
import { lt } from "date-fns/locale";
import LoginPrompt from "@/components/LoginPrompt";
import JobTypeTag from "@/components/JobTypeTag";
import Image from "next/image";

type JobDetailsProps = { params: Promise<{ id: string }> };

export default async function JobDetailsPage({ params }: JobDetailsProps) {
    const session = await auth();
    const userId = session?.user.id;
    const postId = (await params).id;

    const existing = await db.jobPost.findUnique({
        where: { id: postId },
        select: { id: true },
    });

    if (!existing) return notFound();

    const post = await db.jobPost.update({
        where: { id: postId },
        data: { views: { increment: 1 } },
        include: {
            author: { select: { id: true, name: true, email: true } },
            messages: {
                include: {
                    sender: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    const isOwner = userId === post.authorId;

    return (
        <section className="max-w-3xl mx-auto space-y-6">
            <header>
                <h1 className="text-2xl font-semibold">{post.title}</h1>
                <JobTypeTag category={post.category} />
                <div className="text-sm text-gray-500 mt-2">
                    Autorius: {post.author?.email && post.author.email}
                </div>
                <div className="text-xs text-gray-400">
                    {isOwner || session?.user.role === "CONTROLLER" ? (
                        <span>Peržiūros: {post.views} </span>
                    ) : null}
                    <span>
                        Paskelbta{" "}
                        {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: lt,
                        })}
                    </span>
                </div>
            </header>

            {post.image && (
                <div className="relative w-full h-64">
                    <Image
                        src={`/api/${post.image}`}
                        alt={post.title}
                        fill
                        className="object-cover rounded-md"
                    />
                </div>
            )}

            <article className="prose max-w-none">
                <p className="text-gray-800 whitespace-pre-line">
                    {post.description}
                </p>
            </article>

            <section className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Žinutės</h2>

                {!session && (
                    <p className="text-sm text-gray-500">
                        Norėdami parašyti žinutę, <LoginPrompt />.
                    </p>
                )}

                {session && userId && <MessageForm postId={post.id} />}

                {isOwner && (
                    <p className="text-sm text-gray-500 mb-2">
                        Jūs esate šio skelbimo autorius. Žemiau matysite gautas
                        žinutes.
                    </p>
                )}

                {post.messages.length === 0 && (
                    <p className=" mt-4 text-sm text-gray-400 italic">
                        Kol kas nėra jokių žinučių.
                    </p>
                )}

                <ul className="space-y-3 mt-4">
                    {post.messages.map((m) => (
                        <li
                            key={m.id}
                            className={`border rounded p-3 ${
                                m.senderId === userId
                                    ? "bg-blue-50"
                                    : "bg-gray-50"
                            }`}
                        >
                            <div className="text-sm flex justify-between">
                                <div>
                                    <span className="font-medium">
                                        {m.sender.name ?? "Nežinomas"}
                                    </span>{" "}
                                    <span className="text-gray-500 text-xs">
                                        ({m.sender.email})
                                    </span>
                                </div>

                                <span className="text-xs text-gray-400">
                                    {formatDistanceToNow(
                                        new Date(m.createdAt),
                                        {
                                            addSuffix: true,
                                            locale: lt,
                                        }
                                    )}
                                </span>
                            </div>

                            <p className="text-gray-800 text-sm whitespace-pre-line mt-1">
                                {m.content}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>
        </section>
    );
}
