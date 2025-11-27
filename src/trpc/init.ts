import { initTRPC, TRPCError } from "@trpc/server";
import type { Session, User } from "better-auth";
import type { db as database } from "@/db";

export interface TrpcContext {
	db: typeof database;
	user: User | null;
	session: Session | null;
}

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<TrpcContext>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires authentication
 * Throws UNAUTHORIZED error if user is not logged in
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user || !ctx.session) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({
		ctx: {
			user: ctx.user,
			session: ctx.session,
		},
	});
});
