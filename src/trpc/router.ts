import { lazy } from "@trpc/server";
import { router } from "@/trpc/init";

export const appRouter = router({
	test: lazy(() => import("./routers/test").then((mod) => mod.testRouter)),
});

export type AppRouter = typeof appRouter;
