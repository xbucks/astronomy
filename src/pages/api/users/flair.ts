import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { User } from "../../../models/user";

export async function post({ locals, request }: APIContext) {
	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	if (typeof req !== "string") return rmsg("Invalid flair", 400);
	if (!user.flairs.includes(req))
		return rmsg("You don't own that flair", 400);

	await User.updateOne({ id: user.id }, { equippedFlair: req });

	return rmsg("Flair picked", 200);
}
