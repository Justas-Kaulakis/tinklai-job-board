// src/components/JobCard.tsx
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { lt } from "date-fns/locale";

type JobCardProps = {
    id: string;
    title: string;
    description: string;
    category: string;
    authorName?: string | null;
    views: number;
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
                <span
                    className={`text-xs px-2 py-1 rounded ${
                        category === "OFFER"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                >
                    {category === "OFFER" ? "Siūlau darbą" : "Ieškau darbo"}
                </span>
            </div>

            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                {description}
            </p>

            <div className="text-xs text-gray-500 flex justify-between">
                <span>Autorius: {authorName ?? "Nežinomas"}</span>
                <span>
                    Galioja dar{" "}
                    {formatDistanceToNow(expiresAt, {
                        addSuffix: true,
                        locale: lt,
                    })}
                </span>
            </div>

            <div className="text-xs text-gray-400 mt-1">Peržiūros: {views}</div>
        </Link>
    );
}
