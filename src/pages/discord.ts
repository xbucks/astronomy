import type { APIContext } from "astro";

export async function get({ redirect }: APIContext) {
	return redirect("https://discord.gg/6FD2bYMqV9");
}
