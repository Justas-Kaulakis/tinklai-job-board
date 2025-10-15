"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleCanPost, updateUserRole } from "@/lib/actions/admin";

export function AdminUserRow({ user }: { user: any }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            const res = await toggleCanPost(user.id);
            if (res.success) toast.success(res.message);
            else toast.error(res.message);
        });
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value;
        startTransition(async () => {
            const res = await updateUserRole(user.id, newRole);
            if (res.success) toast.success(res.message);
            else toast.error(res.message);
        });
    };

    const allowRoleChange = false;

    return (
        <tr className="border-t hover:bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
            <td className="px-3 py-2">{user.name ?? "—"}</td>
            <td className="px-3 py-2">{user.email}</td>
            <td className="px-3 py-2">
                <select
                    defaultValue={user.role}
                    onChange={handleRoleChange}
                    disabled={isPending || !allowRoleChange}
                    className="border rounded px-2 py-1 text-xs bg-white"
                >
                    <option value="CLIENT">CLIENT</option>
                    <option value="CONTROLLER">CONTROLLER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            </td>
            <td className="px-3 py-2">
                <button
                    onClick={handleToggle}
                    disabled={isPending}
                    className={`px-2 py-1 text-xs rounded ${
                        user.canPost
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                >
                    {user.canPost ? "Leidžiama" : "Uždrausta"}
                </button>
            </td>
            <td className="px-3 py-2 text-gray-500">
                {new Date(user.createdAt).toLocaleDateString("lt-LT")}
            </td>
            <td className="px-3 py-2 text-right text-gray-400 text-xs">
                ID: {user.id.slice(0, 6)}…
            </td>
        </tr>
    );
}
