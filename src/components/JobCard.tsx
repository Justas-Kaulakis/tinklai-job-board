// src/components/JobCard.tsx
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { lt } from "date-fns/locale";
import JobTypeTag from "./JobTypeTag";

type JobCardProps = {
    id: string;
    title: string;
    description: string;
    category: string;
    authorName?: string | null;
    views?: number;
    expiresAt: Date;
};

export function JobCard({
    id,
    title,
    description,
    category,
    authorName,
    views,
    expiresAt,
}: JobCardProps) {
    return (
        <Link
            href={`/jobs/${id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 transition"
        >
            <div className="flex justify-between items-center mb-1">
                <h2 className="text-lg font-semibold">{title}</h2>
                <JobTypeTag category={category} />
            </div>

            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                {description}
            </p>

            <div className="text-xs text-gray-500 flex justify-between">
                <span>Autorius: {authorName ?? "Nežinomas"}</span>
                <span>
                    Galiojimas pasibaigs{" "}
                    <b>
                        {formatDistanceToNow(expiresAt, {
                            addSuffix: true,
                            locale: lt,
                        })}
                    </b>
                </span>
            </div>
            {views ? (
                <div className="text-xs text-gray-400 mt-1">
                    Peržiūros: {views}
                </div>
            ) : null}
        </Link>
    );
}
