import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema/auth";

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
	},
	database: drizzleAdapter(db, {
		provider: "pg",
		transaction: true,
		schema: {
			user: user,
			session: session,
			account: account,
			verification: verification,
		},
	}),
	experimental: {
		joins: true,
	},
});
