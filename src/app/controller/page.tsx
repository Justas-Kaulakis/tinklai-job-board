import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { ControllerPostRow } from "@/components/ControllerPostRow";

export default async function ControllerPage() {
    const session = await auth();
    const user = session?.user;

    // Get all job posts with author info
    const posts = await db.jobPost.findMany({
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
    });

    return (
        <section className="max-w-5xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Skelbimų kontrolė</h1>
                <p className="text-sm text-gray-500">
                    Prisijungęs kaip {user?.email} ({user?.role})
                </p>
            </header>

            {posts.length === 0 ? (
                <p className="text-gray-500 text-sm">Nėra jokių skelbimų.</p>
            ) : (
                <table className="w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left px-3 py-2">Pavadinimas</th>
                            <th className="text-left px-3 py-2">Autorius</th>
                            <th className="text-left px-3 py-2">Kategorija</th>
                            <th className="text-left px-3 py-2">Peržiūros</th>
                            <th className="text-left px-3 py-2">Sukurta</th>
                            <th colSpan={2} className="px-3 py-2 ">
                                Veiksmai
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((post) => (
                            <ControllerPostRow key={post.id} post={post} />
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
