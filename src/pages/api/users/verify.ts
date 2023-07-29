import type { APIContext } from "astro";
import { User } from "../../../models/user";
import { rmsg } from "../../../helper/res";

export async function post({ locals, request }: APIContext) {
	const { needsVerification, loggedIn } = locals.auth;
	if (!needsVerification && loggedIn)
		return rmsg("You do not meet verification criteria", 400);

	const req = await request.json();

	if (typeof req.code !== "string") return rmsg("Invalid code", 400);

	const foundUser = await User.findOne({ emailVerified: req.code.trim() });
	if (!foundUser) return rmsg("Wrong code", 400);

	foundUser.emailVerified = true;
	await foundUser.save();

	return rmsg("Welcome to Galaxy!", 200);
}
