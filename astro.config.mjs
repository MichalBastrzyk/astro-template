// @ts-check

import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: "http://localhost:3000",
	output: "server",

	vite: {
		plugins: [tailwindcss()],
	},

	integrations: [
		sitemap({
			// TODO: Enable i18n when ready
			// i18n: {
			// 	defaultLocale: "pl",
			// 	locales: {
			// 		en: "en-US",
			// 		pl: "pl-PL",
			// 	},
			// },
		}),
	],

	experimental: {
		csp: true,
		// liveContentCollections: true,
		clientPrerender: true,
		contentIntellisense: true,
		chromeDevtoolsWorkspace: true,
		svgo: true,

		// TODO: Add custom fonts using fontProviders API
	},

	adapter: vercel(),
});
