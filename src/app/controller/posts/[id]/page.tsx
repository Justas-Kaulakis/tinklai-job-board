export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <>
            <div>Review a specific post (with delete option)</div>
            <p>post id: {id}</p>
        </>
    );
}
