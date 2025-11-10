"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { deleteJob } from "@/lib/actions/jobs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { lt } from "date-fns/locale";
import Link from "next/link";
import { Prisma } from "@prisma/client";

type Post = Prisma.JobPostGetPayload<{
    include: { author: { select: { name: true; email: true } } };
}>;

export function ControllerPostsTable({ posts }: { posts: Post[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<Post>[] = [
        {
            accessorKey: "title",
            header: "Pavadinimas",
            cell: ({ row }) => row.original.title,
        },
        {
            accessorKey: "author.name",
            header: "Autorius",
            cell: ({ row }) => (
                <span>
                    {row.original.author?.name ?? "Nežinomas"}{" "}
                    <span className="text-gray-400 text-xs">
                        ({row.original.author?.email})
                    </span>
                </span>
            ),
        },
        {
            accessorKey: "category",
            header: "Kategorija",
            cell: ({ row }) =>
                row.original.category === "OFFER"
                    ? "Siūlau darbą"
                    : "Ieškau darbo",
        },
        {
            accessorKey: "views",
            header: "Peržiūros",
            cell: ({ row }) => row.original.views ?? 0,
        },
        {
            accessorKey: "createdAt",
            header: "Sukurta",
            sortingFn: "datetime",
            cell: ({ row }) =>
                formatDistanceToNow(new Date(row.original.createdAt), {
                    addSuffix: true,
                    locale: lt,
                }),
        },
        {
            id: "view",
            header: "Peržiūrėti",
            cell: ({ row }) => (
                <Link
                    href={`/jobs/${row.original.id}`}
                    className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
                >
                    Atidaryti
                </Link>
            ),
            enableSorting: false,
        },
        {
            id: "delete",
            header: "Ištrinti",
            cell: ({ row }) => (
                <button
                    onClick={async () => {
                        if (
                            !confirm(
                                `Ar tikrai norite ištrinti skelbimą "${row.original.title}"?`
                            )
                        )
                            return;
                        const res = await deleteJob(row.original.id);
                        if (res.success) toast.success("Skelbimas ištrintas");
                        else toast.error(res.message);
                    }}
                    className="px-3 py-1 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50"
                >
                    Ištrinti
                </button>
            ),
            enableSorting: false,
        },
    ];

    const table = useReactTable({
        data: posts,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <table className="w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                className="text-left px-3 py-2 cursor-pointer select-none"
                            >
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                                {header.column.getIsSorted() === "asc" && " ▲"}
                                {header.column.getIsSorted() === "desc" && " ▼"}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-t hover:bg-gray-50">
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-3 py-2">
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
