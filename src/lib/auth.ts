import NextAuth, { CredentialsSignin, DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "./db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { schema as loginSchema } from "./schema";
import bcrypt from "bcryptjs";
import z from "zod";
import { v4 as uuid } from "uuid";
import { encode } from "next-auth/jwt";

const adapter = PrismaAdapter(db);

export const { auth, handlers, signIn } = NextAuth({
    adapter,
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
                        throw new CredentialsSignin("Invalid credentials");
                    }

                    const valid = await bcrypt.compare(
                        vCred.password,
                        user.password
                    );
                    if (!valid) {
                        console.warn("Invalid password for", vCred.email);
                        throw new CredentialsSignin("Invalid credentials");
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        canPost: user.canPost,
                    };
                } catch (err) {
                    if (err instanceof z.ZodError) {
                        console.error("Zod validation failed:", err.message);
                        throw new CredentialsSignin("Invalid input format");
                    }
                    console.error("Authorize error:", err);
                    throw new CredentialsSignin("Login failed");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            console.log("in jwt()");
            console.log(token);
            console.log(user);
            if (user) {
                token.role = user.role;
                token.canPost = user.canPost;
                token.credentials = true;
            }
            return token;
        },
        async session({ session, user, token }) {
            console.log("in session()");
            console.log(session);
            console.log(user);
            console.log(token);
            if (user) {
                session.user.role = user.role;
                session.user.canPost = user.canPost;
            } else if (token) {
                session.user.role = token.role || "CLIENT";
                session.user.canPost = token.canPost || false;
            }
            return session;
        },
    },
    jwt: {
        encode: async function (params) {
            if (params.token?.credentials) {
                const sessionToken = uuid();

                if (!params.token.sub) {
                    throw new Error("No user ID found in token");
                }
                const createdSession = await adapter?.createSession?.({
                    sessionToken: sessionToken,
                    userId: params.token.sub,
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                });
                if (!createdSession) {
                    throw new Error("Failed to create session");
                }
                return sessionToken;
            }
            return encode(params);
        },
    },
});
