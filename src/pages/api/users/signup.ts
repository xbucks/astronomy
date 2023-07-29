import { User, generateTokenHeaders, userSchema } from "../../../models/user";
import type { APIContext } from "astro";
import bcrypt from "bcryptjs";
import { env } from "../../../helper/env";
import { keyv } from "../../../models/keyv";
import { rmsg } from "../../../helper/res";
import { sendVerifyMail } from "../../../helper/mail";
import sharp from "sharp";
import { updatePfps } from "../../../helper/img";

export async function post({ request, clientAddress }: APIContext) {
	const isLockdown = await keyv.get("usersLocked", false);
	if (isLockdown)
		return rmsg(
			"The creation of new accounts is disabled at this moment.",
			503
		);

	const req = await request.json();

	if (typeof req.captcha !== "string") return rmsg("Are you a human?", 400);
	const formData = new FormData();
	formData.append("secret", env.TURNSTILE_SECRETKEY);
	formData.append("response", req.captcha);
	formData.append(
		"remoteip",
		request.headers.get("CF-Connecting-IP") ?? clientAddress
	);

	const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
	const captcha = await fetch(url, {
		body: formData,
		method: "POST",
	});
	const { success } = await captcha.json();
	if (success !== true) return rmsg("Are you a human?", 400);

	// Validate the request body first
	const result = userSchema.safeParse(req);
	if (result.success === false)
		return rmsg(result.error.issues[0].message, 400);

	// Prevent Gmail symbols or aliases
	const email = req.email
		.split(/\.(?=.*@g(?:oogle)?mail.com$)|\+.*(?=@g(?:oogle)?mail.com)/i)
		.join("");

	// Find an existing user
	let user = await User.findOne({ email });
	if (user) return rmsg("An account already exists with that email.", 400);
	user = await User.findOne({ name: req.name });
	if (user) return rmsg("That username is taken. Try something else.", 400);

	const lastUserId = await keyv.id("lastUserId");

	user = new User({
		name: req.name,
		password: req.password,
		email: email,
		id: lastUserId,
	});
	user.password = await bcrypt.hash(user.password, 12);
	user.pfpTimestamp = Date.now();
	await user.save();

	await sendVerifyMail(email, user.emailVerified);

	// Yes, I know I'm not awaiting this. So what?
	updatePfps(
		sharp("public/unknown-user.webp"),
		lastUserId,
		user.pfpTimestamp,
		0
	);

	// TODO i'd switch the cookie code over to this, but i haven't tested if it works yet...
	// cookies.set("token", token, { path: "/", ... })

	return new Response(
		JSON.stringify({
			name: user.name,
			email: user.email,
			id: user.id,
		}),
		{
			status: 201,
			headers: generateTokenHeaders(user),
		}
	);
}
