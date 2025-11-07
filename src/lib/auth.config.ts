import { CredentialsSignin, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./validation";
import db from "./db";
import bcrypt from "bcryptjs";
import { RoleType } from "@/types/next-auth";
import z from "zod";

export default {
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                try {
                    const vCred = loginSchema.parse(credentials);

                    const user = await db.user.findUnique({
                        where: { email: vCred.email },
                    });

                    if (!user || !user.password) {
                        console.warn(
                            "No user found or password missing for",
                            vCred.email
                        );
                        return null;
                    }

                    const valid = await bcrypt.compare(
                        vCred.password,
                        user.password
                    );
                    if (!valid) {
                        console.warn("Invalid password for", vCred.email);
                        return null;
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role as RoleType,
                        canPost: user.canPost,
                    };
                } catch (err) {
                    if (err instanceof z.ZodError) {
                        console.error("Zod validation failed:", err.message);
                        throw new CredentialsSignin(
                            "Netinkamas prisijungimo formatas"
                        );
                    }
                    if (err instanceof CredentialsSignin) throw err;

                    console.error("Authorize error:", err);
                    throw new CredentialsSignin(
                        "Ivyko klaida jungantis prie paskyros"
                    );
                }
            },
        }),
    ],
} satisfies NextAuthConfig;
