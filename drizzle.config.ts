import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema/index.ts",
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
