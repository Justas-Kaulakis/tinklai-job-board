import NextAuth, { CredentialsSignin } from "next-auth";
import { RoleType } from "@/types/next-auth";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import z from "zod";
import db from "./db";
import { loginSchema } from "./validation";

export const { auth, handlers, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
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
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.canPost = user.canPost;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role || "CLIENT";
                session.user.canPost = token.canPost || false;
            }
            return session;
        },
    },
});
