import { SessionProvider } from "next-auth/react";
// app/(auth)/layout.tsx
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="h-[calc(100vh-6.6rem)] flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm">
                {children}
            </div>
        </main>
    );
}
