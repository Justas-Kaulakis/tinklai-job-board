import { DefaultUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

type RoleType = "CLIENT" | "ADMIN" | "CONTROLLER";

declare module "next-auth" {
    interface User extends DefaultUser {
        role: RoleType;
        canPost: boolean;
    }

    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role: RoleType;
            canPost: boolean;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT extends NextAuthJWT {
        role?: RoleType;
        canPost?: boolean;
    }
}
