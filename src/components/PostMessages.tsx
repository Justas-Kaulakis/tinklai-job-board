"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createDeletionRequest, deleteMessage } from "@/lib/actions/messages";
import { formatDistanceToNow } from "date-fns";
import { lt } from "date-fns/locale";
import { Prisma } from "@prisma/client";

type DashboardMessage = Prisma.MessageGetPayload<{
    include: {
        sender: {
            select: { id: true | undefined; name: true; email: true };
        };
        _count: {
            select: {
                messageDeletionRequests: true;
            };
        };
    };
}>;

const PostMessages = ({
    messages,
    userId,
}: {
    messages: DashboardMessage[];
    userId: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string) => {
        startTransition(async () => {
            const res = await deleteMessage(id);
            if (res.success) toast.success("Žinutė ištrinta");
            else toast.error(res.message);
        });
    };

    const handleFlag = (id: string) => {
        startTransition(async () => {
            const res = await createDeletionRequest(id);
            if (res.success) toast.success("Žinutė pažymėta kontrolieriui");
            else toast.error(res.message);
        });
    };

    return (
        <div className="mt-3">
            {messages.length === 0 ? (
                <button
                    disabled
                    className="text-sm underline disabled:text-gray-500"
                >
                    Žinučių nėra
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-sm underline text-blue-600"
                >
                    {isOpen ? "Slėpti žinutes" : `Rodyti žinutes`} (
                    {messages.length})
                </button>
            )}

            {isOpen && (
                <ul className="mt-3 space-y-2 border rounded p-3 bg-gray-50">
                    {messages.map((msg) => (
                        <li
                            key={msg.id}
                            className="border rounded p-2 bg-white flex justify-between"
                        >
                            <div>
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs text-gray-400">
                                    Nuo: {msg.sender.name} ({msg.sender.email})
                                </p>
                                <p className="text-xs text-gray-400 italic">
                                    {formatDistanceToNow(
                                        new Date(msg.createdAt),
                                        {
                                            addSuffix: true,
                                            locale: lt,
                                        }
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {msg.senderId === userId ? (
                                    <button
                                        disabled={isPending}
                                        onClick={() => handleDelete(msg.id)}
                                        className="text-sm px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50"
                                    >
                                        Ištrinti
                                    </button>
                                ) : (
                                    <button
                                        disabled={
                                            isPending ||
                                            msg._count.messageDeletionRequests >
                                                0
                                        }
                                        onClick={() => handleFlag(msg.id)}
                                        className={`text-sm px-3 py-1 rounded border ${
                                            msg._count.messageDeletionRequests >
                                            0
                                                ? "border-orange-300 text-orange-600 cursor-not-allowed"
                                                : "border-blue-300 text-blue-400 hover:bg-blue-100"
                                        } disabled:opacity-50`}
                                    >
                                        {msg._count.messageDeletionRequests > 0
                                            ? "Pažymėta trinimui"
                                            : "Pažymėti trinimui"}
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PostMessages;
