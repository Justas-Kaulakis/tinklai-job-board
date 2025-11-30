"use client";

import { deleteMessage } from "@/lib/actions/messages";
import { useTransition } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { lt } from "date-fns/locale";
import { Prisma } from "@prisma/client";

type RequestType = Prisma.MessageDeletionRequestGetPayload<{
    include: {
        message: {
            include: {
                sender: { select: { name: true; email: true } };
                post: { select: { id: true; title: true } };
            };
        };
        requestedBy: { select: { name: true; email: true } };
    };
}>;

export function ControllerDeletionRequestsTable({
    requests,
}: {
    requests: RequestType[];
}) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (messageId: string) => {
        if (!confirm("Ar tikrai norite ištrinti šią žinutę?")) return;

        startTransition(async () => {
            const res = await deleteMessage(messageId);
            if (res.success) toast.success("Žinutė ištrinta");
            else toast.error(res.message);
        });
    };

    return (
        <table className="w-full border border-gray-200 text-sm mt-10">
            <thead className="bg-red-50">
                <tr>
                    <th className="text-left px-3 py-2">Žinutė</th>
                    <th className="text-left px-3 py-2">Nuo</th>
                    <th className="text-left px-3 py-2">Skelbimas</th>
                    <th className="text-left px-3 py-2">Pažymėjo</th>
                    <th className="text-left px-3 py-2">Pateikta</th>
                    <th className="px-3 py-2 text-right">Veiksmai</th>
                </tr>
            </thead>

            <tbody>
                {requests.map((req) => (
                    <tr key={req.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 max-w-xs">
                            {req.message.content}
                        </td>

                        <td className="px-3 py-2">
                            {req.message.sender.name}
                            <span className="text-xs text-gray-400">
                                {" "}
                                ({req.message.sender.email})
                            </span>
                        </td>

                        <td className="px-3 py-2">
                            <a
                                className="text-blue-600 underline text-xs"
                                href={`/jobs/${req.message.post.id}`}
                            >
                                {req.message.post.title}
                            </a>
                        </td>

                        <td className="px-3 py-2">
                            {req.requestedBy.name}
                            <span className="text-xs text-gray-400">
                                {" "}
                                ({req.requestedBy.email})
                            </span>
                        </td>

                        <td className="px-3 py-2 text-xs text-gray-500">
                            {formatDistanceToNow(new Date(req.createdAt), {
                                addSuffix: true,
                                locale: lt,
                            })}
                        </td>

                        <td className="px-3 py-2 text-right">
                            <button
                                disabled={isPending}
                                onClick={() => handleDelete(req.messageId)}
                                className="px-3 py-1 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                                Ištrinti
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
