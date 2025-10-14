// app/dashboard/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="min-h-[calc(100vh-6.6rem)] bg-gray-50">
            <main className="container mx-auto px-4 py-8">{children}</main>
        </section>
    );
}
