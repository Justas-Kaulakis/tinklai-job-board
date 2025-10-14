"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const LoginPrompt = () => {
    const pathname = usePathname();
    const search = useSearchParams().toString();
    const callbackUrl = `${pathname}${search ? `?${search}` : ""}`;
    console.log(callbackUrl);
    return (
        <Link
            href={{
                pathname: "/sign-in",
                query: { callback: encodeURIComponent(callbackUrl) },
            }}
            className="underline"
        >
            prisijunkite
        </Link>
    );
};

export default LoginPrompt;
