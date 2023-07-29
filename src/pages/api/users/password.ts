import { User, generateTokenHeaders } from "../../../models/user";
import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import bcrypt from "bcryptjs";

export async function post({ locals, request }: APIContext) {
	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	const req = await request.json();
	if (typeof req.new !== "string")
		return rmsg("New password not provided", 400);
	if (req.new.length > 128)
		return rmsg("New password is too long (max: 128)", 400);
	if (req.new.length < 3)
		return rmsg("New password is too short (min: 3)", 400);

	if (typeof req.old !== "string")
		return rmsg("Old password not provided", 400);
	if (req.old.length > 128)
		return rmsg("Old password is too long (max: 128)", 400);
	if (req.old.length < 3)
		return rmsg("Old password is too short (min: 3)", 400);

	// because AC2U deletes the password (for sanity+security), we re-query user
	// shouldn't be a big performance toll
	const userDoc = await User.findOne({ id: user.id });

	const isCorrect = await bcrypt.compare(req.old, userDoc.password);
	if (!isCorrect) return rmsg("Old password is not correct", 400);

	const isSame = await bcrypt.compare(req.new, userDoc.password);
	if (isSame) return rmsg("New password matches old password", 400);

	userDoc.password = await bcrypt.hash(req.new, 12);
	userDoc.sessionState++;
	await userDoc.save();

	return new Response(
		JSON.stringify({
			message: "Password updated!",
		}),
		{
			status: 200,
			headers: generateTokenHeaders(userDoc),
		}
	);
}
