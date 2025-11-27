import { createAuthClient } from "better-auth/react";
import { getBaseUrl } from "@/trpc/utils";

export const authClient = createAuthClient({
	baseURL: getBaseUrl(),
});
