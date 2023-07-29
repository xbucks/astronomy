import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { User } from "../../../models/user";

export async function post({ locals, request }: APIContext) {
	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	if (req.bio == null) return rmsg("No bio provided.", 400);
	const bio = req.bio.toString();
	if (bio.length > 1024)
		return rmsg("Bios are limited to 1,024 characters.", 400);

	const dbU = await User.findOne({ id: user.id });
	dbU.bio = bio;
	await dbU.save();

	return rmsg("Bio updated!");
}
