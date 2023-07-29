import type { APIContext } from "astro";

export function get({ redirect, params }: APIContext) {
	return redirect(`/play/${params.gameId}`, 301);
}
