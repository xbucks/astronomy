import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Message } from "../../../models/message";

export async function get({ locals }: APIContext) {
	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	await Message.updateMany(
		{ to: user.id, read: false, deleted: false },
		{ read: true }
	);

	return rmsg("done");
}
