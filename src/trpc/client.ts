import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/trpc/router";
import { getBaseUrl } from "@/trpc/utils";

export const api = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${getBaseUrl()}/api/trpc`,
		}),
	],
});
