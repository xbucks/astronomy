import type { APIContext } from "astro";

export async function get({ cookies, redirect }: APIContext) {
	cookies.delete("token", { path: "/" });

	return redirect("/");
}
