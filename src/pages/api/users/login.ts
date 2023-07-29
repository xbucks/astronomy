import { User, fromEmail, generateTokenHeaders } from "../../../models/user";
import type { APIContext } from "astro";
import bcrypt from "bcryptjs";
import { rmsg } from "../../../helper/res";

export async function post({ request }: APIContext) {
	const req = await request.json();

	// Find an existing user
	let user = await fromEmail(req.email);
	if (!user) {
		user = await User.findOne({ name: req.email });
		if (!user) return rmsg("User not registered", 400);
	}

	if (typeof req.password !== "string")
		return rmsg("Password not provided/invalid password", 400);
	if (req.password.length > 128) return rmsg("Wrong password");

	const equal = await bcrypt.compare(req.password, user.password);
	if (!equal) return rmsg("Wrong password", 400);

	return new Response(
		JSON.stringify({
			name: user.name,
			email: user.email,
			id: user.id,
		}),
		{
			status: 200,
			headers: generateTokenHeaders(user),
		}
	);
}
