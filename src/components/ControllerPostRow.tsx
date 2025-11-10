"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteJob } from "@/lib/actions/jobs";
import { formatDistanceToNow } from "date-fns";
import { lt } from "date-fns/locale";
import Link from "next/link";
import { Prisma } from "@prisma/client";

export function ControllerPostRow({
    post,
}: {
    post: Prisma.JobPostGetPayload<{
        include: { author: { select: { name: true; email: true } } };
        orderBy: { createdAt: "desc" };
    }>;
}) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Ar tikrai norite ištrinti skelbimą "${post.title}"?`))
            return;
        startTransition(async () => {
            const res = await deleteJob(post.id);
            if (res.success) toast.success("Skelbimas ištrintas");
            else toast.error(res.message);
        });
    };

    return (
        <tr className="border-t hover:bg-gray-50">
            <td className="px-3 py-2">{post.title}</td>
            <td className="px-3 py-2">
                {post.author?.name ?? "Nežinomas"}{" "}
                <span className="text-gray-400 text-xs">
                    ({post.author?.email})
                </span>
            </td>
            <td className="px-3 py-2">
                {post.category === "OFFER" ? "Siūlau darbą" : "Ieškau darbo"}
            </td>
            <td className="px-3 py-2">{post.views}</td>
            <td className="px-3 py-2 text-gray-500 text-xs">
                {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: lt,
                })}
            </td>
            <td className="px-3 py-2">
                <Link
                    href={`/jobs/${post.id}`}
                    className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
                >
                    Peržiūrėti
                </Link>
            </td>
            <td className="px-3 py-2 text-right">
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="px-3 py-1 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                    Ištrinti
                </button>
            </td>
        </tr>
    );
}
