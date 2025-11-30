import db from "@/lib/db";
import { auth } from "@/lib/auth";
import { ControllerPostsTable } from "@/components/ControllerPostsTable";
import { ControllerDeletionRequestsTable } from "@/components/ControllerDeletionRequestsTable";

export default async function ControllerPage() {
    const session = await auth();
    const user = session?.user;

    // Get all job posts with author info
    const posts = await db.jobPost.findMany({
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
    });

    // Get message deletion requests
    const deletionRequests = await db.messageDeletionRequest.findMany({
        include: {
            message: {
                include: {
                    sender: { select: { name: true, email: true } },
                    post: { select: { id: true, title: true } },
                },
            },
            requestedBy: { select: { name: true, email: true } },
        },
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
                <ControllerPostsTable posts={posts} />
            )}
            <div>
                <h2 className="text-xl font-semibold mt-10">
                    Žinučių trynimo užklausos
                </h2>

                {deletionRequests.length === 0 ? (
                    <p className="text-gray-500 text-sm mt-2">
                        Nėra pažymėtų žinučių.
                    </p>
                ) : (
                    <ControllerDeletionRequestsTable
                        requests={deletionRequests}
                    />
                )}
            </div>
        </section>
    );
}
