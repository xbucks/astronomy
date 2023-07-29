import { rdata, rfu } from "../../../helper/res";
import type { APIContext } from "astro";

export async function get({ locals }: APIContext) {
	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	return rdata(user);
}
