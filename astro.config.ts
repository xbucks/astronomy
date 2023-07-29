import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";
import path from "path";
import { tRPCDevSocket } from "./src/backend/wsDevServer";

import react from "@astrojs/react";
import svelte from "@astrojs/svelte";

import node from "@astrojs/node";

export default defineConfig({
	integrations: [
		tRPCDevSocket({
			createContextName: "socketContext",
			port: 8443,
			routerFilePath: path.resolve(
				path.dirname(fileURLToPath(import.meta.url)),
				"src/backend/router.ts"
			),
			routerName: "socketRouter",
		}),
		svelte(),
		react(),
	],
	adapter: node({
		mode: "middleware",
	}),
	output: "server",
	outDir: "dist/main",
	vite: {
		ssr: {
			external: [],
			noExternal: [],
		},
		build: {
			commonjsOptions: {
				transformMixedEsModules: true,
			},
		},
	},
	site: "https://galaxy.click",
	compressHTML: true,
});
