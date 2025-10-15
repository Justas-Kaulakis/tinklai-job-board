import { signOut } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

const Header = ({
    isAuthed,
    role,
    canPost,
    email,
}: {
    isAuthed: boolean;
    role: "CLIENT" | "CONTROLLER" | "ADMIN" | "GUEST";
    canPost: boolean;
    email?: string;
}) => {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                <nav className="flex items-center gap-4">
                    <Link href="/" className="font-semibold">
                        <div className="flex justify-around items-center ">
                            <Image
                                width="40"
                                height="40"
                                alt=""
                                src="/job.png"
                                className="mr-1 mt-[-10px]"
                            />
                            <span className="">Board</span>
                        </div>
                    </Link>
                    {isAuthed && (
                        <Link
                            href="/dashboard"
                            className="text-sm hover:underline"
                        >
                            Dashboard
                        </Link>
                    )}
                    {role === "CONTROLLER" /*|| role === "ADMIN"*/ && (
                        <Link
                            href="/controller"
                            className="text-sm hover:underline"
                        >
                            Controller
                        </Link>
                    )}
                    {role === "ADMIN" && (
                        <Link href="/admin" className="text-sm hover:underline">
                            Admin
                        </Link>
                    )}
                </nav>
                <div className="flex items-center gap-3">
                    {isAuthed ? (
                        <>
                            <span className="text-xs text-gray-600">
                                {email} • Rolė: {role}
                                {role === "CLIENT" &&
                                    (canPost ? " • canPost" : " • read-only")}
                            </span>
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut();
                                }}
                            >
                                <button
                                    type="submit"
                                    className="text-sm underline underline-offset-4"
                                >
                                    Sign out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="text-sm hover:underline"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/sign-up"
                                className="text-sm hover:underline"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
export { Header };
