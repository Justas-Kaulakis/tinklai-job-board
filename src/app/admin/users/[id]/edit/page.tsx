export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <div>Manage single user (role / canPost toggle)</div>;
}
