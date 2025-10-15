import Link from "next/link";
import Image from "next/image";
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
    image?: string | null;
};

export function JobCard({
    id,
    title,
    description,
    category,
    authorName,
    views,
    expiresAt,
    image,
}: JobCardProps) {
    return (
        <Link
            href={`/jobs/${id}`}
            className="group  w-full max-w-3xl flex gap-4 py-4 border-b border-gray-200 "
        >
            {/* --- Thumbnail --- */}
            <div className="relative  w-40 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                {image ? (
                    <Image
                        src={`/${image}`}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, 160px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-100">
                        Nėra nuotraukos
                    </div>
                )}
            </div>

            {/* --- Text Content --- */}
            <div className="flex flex-col justify-between flex-grow min-w-0">
                <div>
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="text-base sm:text-lg font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {title}
                        </h2>
                        <JobTypeTag category={category} />
                    </div>

                    <p className="text-sm hidden md:block   text-gray-700 line-clamp-2 mt-1">
                        {description}
                    </p>
                </div>

                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-3 mt-2">
                    <span>{authorName ?? "Nežinomas"}</span>
                    <span className="text-gray-300">•</span>
                    <span>
                        Galiojimas pasibaigs{" "}
                        <b>
                            {formatDistanceToNow(expiresAt, {
                                addSuffix: true,
                                locale: lt,
                            })}
                        </b>
                    </span>
                    {views !== undefined && (
                        <>
                            <span className="text-gray-300">•</span>
                            <span>Peržiūros: {views}</span>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
}
