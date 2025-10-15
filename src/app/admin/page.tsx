import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { AdminUserRow } from "@/components/AdminUserRow";

export default async function AdminPage() {
    const session = await auth();
    const user = session?.user;

    if (!user || user.role !== "ADMIN") return notFound();

    const users = await db.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <section className="max-w-5xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Vartotojų valdymas</h1>
                <p className="text-sm text-gray-500">
                    Prisijungęs kaip <strong>{user.email}</strong>
                </p>
            </header>

            <table className="w-full border border-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left px-3 py-2">Vardas</th>
                        <th className="text-left px-3 py-2">El. paštas</th>
                        <th className="text-left px-3 py-2">Rolė</th>
                        <th className="text-left px-3 py-2">Gali skelbti?</th>
                        <th className="text-left px-3 py-2">Sukurta</th>
                        <th className="text-left px-3 py-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <AdminUserRow key={u.id} user={u} />
                    ))}
                </tbody>
            </table>
        </section>
    );
}
