import bcrypt from "bcryptjs";
import db from "./db";
import { executeAction } from "./executeAction";
import { schema } from "./schema";

const signUp = async (formData: FormData) => {
    return executeAction({
        actionFn: async () => {
            const email = formData.get("email");
            const password = formData.get("password");
            const validatedData = schema.parse({ email, password });

            // Check if the user already exists
            const existing = await db.user.findUnique({
                where: { email: validatedData.email.toLowerCase() },
            });

            if (existing) {
                throw new Error("This email is already registered.");
            }

            // Hash password securely
            const hashedPassword = await bcrypt.hash(
                validatedData.password,
                10
            );

            await db.user.create({
                data: {
                    email: validatedData.email.toLocaleLowerCase(),
                    password: hashedPassword,
                    canPost: true,
                },
            });
        },
        successMessage: "Your account has been created successfully!",
    });
};

export { signUp };
