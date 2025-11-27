import { auth } from "@/auth";
import { db } from "@/db";
import { appRouter } from "@/trpc/router";

export const createCaller = async (headers: Headers) => {
	const session = await auth.api.getSession({ headers });

	return appRouter.createCaller({
		db,
		user: session?.user ?? null,
		session: session?.session ?? null,
	});
};
