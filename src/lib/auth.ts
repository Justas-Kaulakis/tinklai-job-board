import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import db from "./db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { schema } from "./schema";
import { v4 as uuid } from "uuid";
import { encode } from "next-auth/jwt";

const adapter = PrismaAdapter(db);

export const { auth, handlers, signIn } = NextAuth({
    adapter: adapter,
    providers: [
        GitHub,
        Credentials({
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                const vCred = schema.parse(credentials);

                const user = await db.user.findFirst({
                    where: {
                        email: vCred.email,
                        password: vCred.password,
                    },
                });
                if (!user) {
                    throw new CredentialsSignin();
                }
                return user;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account?.provider === "credentials") {
                token.credentials = true;
            }
            return token;
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
                    expires: new Date(Date.now() + 30 * 24 * 60 * 1000),
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
