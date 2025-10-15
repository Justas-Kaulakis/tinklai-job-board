import { isRedirectError } from "next/dist/client/components/redirect-error";

type Options<T> = {
    actionFn: () => Promise<T>;
    successMessage?: string;
    onErrorMessage?: string;
};

export async function executeAction<T>({
    actionFn,
    successMessage = "The action was successful.",
    onErrorMessage = "An error occurred while executing the action.",
}: Options<T>): Promise<{ success: boolean; message: string }> {
    try {
        await actionFn();
        return { success: true, message: successMessage };
    } catch (error) {
        if (isRedirectError(error)) throw error;

        if (error instanceof Error && error.message) {
            console.error("⚠️ Action failed:", error.message);
            return { success: false, message: error.message };
        }

        console.error("⚠️ Unknown action error:", error);
        return { success: false, message: onErrorMessage };
    }
}
