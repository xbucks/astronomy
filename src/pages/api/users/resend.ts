import type { APIContext } from "astro";
import { User } from "../../../models/user";
import { randomString } from "../../../helper/random";
import { rmsg } from "../../../helper/res";
import { sendVerifyMail } from "../../../helper/mail";

export async function post({ locals }: APIContext) {
	const { needsVerification, user } = locals.auth;
	if (!needsVerification) return rmsg("You're not allowed to do that", 400);

	const foundUser = await User.findOne({ id: user.id });
	foundUser.emailVerified = randomString(32);
	await foundUser.save();

	await sendVerifyMail(foundUser.email, foundUser.emailVerified);

	return rmsg("Resent!", 200);
}
