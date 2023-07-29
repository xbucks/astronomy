import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Message } from "../../../models/message";
import { User } from "../../../models/user";
import { keyv } from "../../../models/keyv";

export async function post({ locals, request }: APIContext) {
	const isLockdown = await keyv.get("messagesLocked", false);
	if (isLockdown)
		return rmsg("Sending messages is disabled at this moment.", 503);

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	const req = await request.json();
	if (typeof req.content !== "string" || req.content.length > 16384)
		return rmsg("Invalid message body", 400);
	if (typeof req.title !== "string" || req.title.length > 128)
		return rmsg("Invalid message body", 400);
	if (typeof req.to !== "number") return rmsg("Invalid recipient", 400);
	const to = await User.findOne({ id: req.to });
	if (!to) return rmsg("Recipient doesn't exist", 400);
	if (to.banned !== false) return rmsg("Recipient is banned", 400);

	const msg = new Message({
		from: user.id,
		to: to.id,
		title: req.title,
		content: req.content,
	});
	await msg.save();

	return rmsg("success");
}
