import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { APIRoute } from "astro";
import { auth } from "@/auth";
import { db } from "@/db";
import { appRouter } from "@/trpc/router";

export const ALL: APIRoute = async (ctx) => {
	const session = await auth.api.getSession({
		headers: ctx.request.headers,
	});

	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req: ctx.request,
		router: appRouter,
		createContext: () => ({ db, user: session?.user ?? null, session: session?.session ?? null }),
	});
};
