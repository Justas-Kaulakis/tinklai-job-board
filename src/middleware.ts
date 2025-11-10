// import { auth } from "@/lib/auth";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./lib/auth.config";
import { auth } from "./lib/auth";

export default auth((req) => {
    const { nextUrl } = req;
    const user = req.auth?.user;

    // If not logged in
    if (!user) {
        const login = new URL("/sign-in", nextUrl);
        login.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(login);
    }

    // Admin area
    if (nextUrl.pathname.startsWith("/admin") && user.role !== "ADMIN") {
        console.log("REDIRECTING BECAUSE USER IS NOT ADMIN!");
        console.log("user: ", user);

        return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Controller area
    if (
        nextUrl.pathname.startsWith("/controller") &&
        !["ADMIN", "CONTROLLER"].includes(user.role)
    ) {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*", "/controller/:path*", "/dashboard/:path*"],
    runtime: "nodejs",
};
