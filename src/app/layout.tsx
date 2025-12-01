// app/layout.tsx
import type { Metadata } from "next";
import { auth } from "@/lib/auth"; // signOut is exported by your NextAuth config
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // Tailwind base if you use it
import { Header } from "@/components/Header";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Tinklai Job Board",
    description: "Simple job board with roles (CLIENT / CONTROLLER / ADMIN)",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = session?.user.role ?? "GUEST";

    return (
        <html lang="en">
            <body
                className={`${geistMono} ${geistSans} min-h-dvh bg-white text-gray-900 antialiased`}
            >
                <SessionProvider session={session}>
                    <Header
                        canPost={session ? session.user.canPost : false}
                        email={session ? session.user.email || "" : " "}
                        isAuthed={!!session}
                        role={role}
                    />
                    <main className="container mx-auto px-4 py-6">
                        {children}
                    </main>
                </SessionProvider>
                <Toaster richColors position="bottom-center" />
                <footer className="mt-12 border-t bg-gray-50">
                    <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
                        <p>
                            Justas Kaulakis © {new Date().getFullYear()} Tinklai
                            Job Board. Visos teisės saugomos.
                        </p>
                        <p>
                            <b>
                                &quot;T120B145 Kompiuterių tinklai ir
                                internetinės technologijos&quot; IT projektas
                            </b>
                        </p>
                    </div>
                </footer>
            </body>
        </html>
    );
}
