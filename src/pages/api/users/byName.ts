import { rdata, rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { User } from "../../../models/user";

export async function get({ locals, url }: APIContext) {
	const name = url.searchParams.get("name");

	const { loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	const user = await User.findOne({ name });
	if (!user) return rmsg("no");

	return rdata({
		message: "yes",
		name: user.name,
		equippedFlair: user.equippedFlair,
		pfpTimestamp: user.pfpTimestamp,
		id: user.id,
		banned: user.banned !== false,
	});
}
