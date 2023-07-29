import { rdata, rmsg } from "../../../../helper/res";
import type { APIContext } from "astro";
import { fromEmail } from "../../../../models/user";
import { randomString } from "../../../../helper/random";
import { sendMail } from "../../../../helper/mail";

export async function post({ request }: APIContext) {
	const req = await request.json();

	if (typeof req.email !== "string") return rmsg("Email not provided", 400);
	if (!req.email.includes("@"))
		return rmsg(
			"You need the email to reset the password of an account",
			400
		);

	const user = await fromEmail(req.email);
	if (!user) return rmsg("User not found", 400);

	user.passwordReset = randomString(32);
	user.passwordResetExpiry = Date.now() + 15 * 1000 * 1000;

	await user.save();

	// /reset?key=user.passwordReset
	await sendMail(user.email, "Galaxy Password Reset", {
		plaintext: `

The link to reset your password is: https://galaxy.click/reset?key=${user.passwordReset}

This link expires in 15 minutes.

If you did not request this action, you can safely ignore this message.
`.trim(),
		html: `

<p>The link to reset your password is: <a href="https://galaxy.click/reset?key=${user.passwordReset}">https://galaxy.click/reset?key=${user.passwordReset}</a></p>

<p>This link expires in 15 minutes.</p>

<p>If you did not request this action, you can safely ignore this message.</p>
`.trim(),
	});

	return rdata({ message: "Email sent!", done: true });
}
