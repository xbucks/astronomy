import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Message } from "../../../models/message";

export async function get({ locals, url }: APIContext) {
	const id = url.searchParams.get("id");

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	const msg = await Message.findOne({ _id: id, deleted: false });
	if (!msg) return rmsg("Message not found", 400);

	if (msg.to !== user.id)
		return rmsg("You are not the recipient of that message", 401);

	await msg.updateOne({
		deleted: true,
	});

	return rmsg("done");
}
