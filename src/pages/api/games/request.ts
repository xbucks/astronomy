import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { GameRequest } from "../../../models/gamerequest";
import { env } from "../../../helper/env";
import sendWebhook from "../../../helper/sendWebhook";
import { z } from "zod";

const schema = z.object({
	name: z.string().trim().max(256),
	link: z.string().trim().url().max(512),
	contact: z.string().max(512),
	also: z.string().trim().max(2048),
});

export async function post({ request, locals }: APIContext) {
	return rmsg(":(", 400);

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	const req = await request.json();

	const result = schema.safeParse(req);
	if (result.success === false)
		return rmsg(result.error.issues[0].message, 400);

	const { name, link, contact, also } = result.data;

	const doc = new GameRequest({
		name,
		link,
		contact,
		also,
		requestAuthor: user.id,
	});

	await doc.save();

	if (env.STAFF_WEBHOOK)
		await sendWebhook(env.STAFF_WEBHOOK, {
			content: `new game ${name} (${link}) has been requested
<https://galaxy.click/admin/housekeeping>`,
			name: "game request",
		});

	return rmsg("success");
}
