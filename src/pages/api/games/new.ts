import { Game, gameSchema } from "../../../models/game";
import { rdata, rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { env } from "../../../helper/env";
import { keyv } from "../../../models/keyv";
import sendWebhook from "../../../helper/sendWebhook";
import sharp from "sharp";
import { updateThumbs } from "../../../helper/img";

export async function post({ locals, request }: APIContext) {
	const isLockdown = await keyv.get("gamesLocked", false);
	if (isLockdown)
		return rmsg(
			"The creation of new games is disabled at this moment.",
			503
		);

	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	// Validate the request body first
	const result = gameSchema.safeParse(req);
	if (result.success === false)
		return rmsg(result.error.issues[0].message, 400);

	if (req.link.includes("https://orteil.dashnet.org/igm"))
		return rmsg(
			"IGM games are not allowed on Galaxy due to them containing advertisements.",
			400
		);
	if (req.link.startsWith("http://"))
		return rmsg("Games uploaded must use https.", 400);
	// Find an existing game
	let game = await Game.findOne({ name: req.name });
	if (game) return rmsg("A game already exists with that name.", 400);

	game = await Game.findOne({ link: req.link });
	if (game) rmsg("A game already exists with that link.", 400);

	const lastGameId = await keyv.id("lastGameId");

	game = new Game({
		name: req.name,
		description: req.description || "No description provided.",
		link: req.link,
		id: lastGameId,
		author: user.id,

		unlisted: req.private || req.unlisted,
		// Dirty AF boolean conversion
		private: !!req.private,
	});
	game.thumbTimestamp = Date.now();
	await game.save();

	// Yes, I know I'm not awaiting this. So what?
	updateThumbs(
		sharp("public/unknown-game.webp"),
		lastGameId,
		game.thumbTimestamp,
		0
	);

	if (env.STAFF_WEBHOOK)
		await sendWebhook(env.STAFF_WEBHOOK, {
			content: `New game ${game.name} needs verification:\n<https://galaxy.click/play/${game.id}>\n<https://galaxy.click/admin/housekeeping>`,
		});

	return rdata({ message: "Thanks for submitting!", id: game.id }, 200);
}
