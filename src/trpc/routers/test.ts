import { protectedProcedure, publicProcedure, router } from "@/trpc/init";

export const testRouter = router({
	test: publicProcedure.query(() => {
		return "test successful";
	}),

	protectedTest: protectedProcedure.query(() => {
		return "protected test successful";
	}),
});
