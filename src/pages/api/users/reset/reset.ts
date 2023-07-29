import { User, generateTokenHeaders } from "../../../../models/user";
import type { APIContext } from "astro";
import bcrypt from "bcryptjs";
import { rmsg } from "../../../../helper/res";

export async function post({ request }: APIContext) {
	const req = await request.json();

	if (typeof req.token !== "string") return rmsg("Invalid token", 400);
	if (typeof req.password !== "string") return rmsg("Invalid password", 400);
	if (req.password.length > 128)
		return rmsg("New password is too long (max: 128)", 400);
	if (req.password.length < 3)
		return rmsg("New password is too short (min: 3)", 400);

	const user = await User.findOne({
		passwordReset: req.token,
		passwordResetExpiry: { $gt: Date.now() },
	});
	if (!user) return rmsg("User not found", 400);

	user.passwordReset = false;
	user.password = await bcrypt.hash(req.password, 12);
	user.sessionState++;

	await user.save();

	return new Response(
		JSON.stringify({
			message: "Password updated!",
			done: true,
		}),
		{
			status: 200,
			headers: generateTokenHeaders(user),
		}
	);
}
