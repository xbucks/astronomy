import { defineConfig } from "astro/config";

// https://astro.build/config
import svelte from "@astrojs/svelte";

// https://astro.build/config
import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
	output: "server",
	integrations: [svelte(), react()],
	adapter: node({ mode: "middleware" }),
});
