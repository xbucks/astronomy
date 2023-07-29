import { Update, updateSchema } from "../../../models/update";
import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Favorite } from "../../../models/favorite";
import { Game } from "../../../models/game";
import type { IGame } from "../../../types";
import { Message } from "../../../models/message";
import { keyv } from "../../../models/keyv";

export async function post({ locals, request }: APIContext) {
	const isLockdown = await keyv.get("updatesLocked", false);
	if (isLockdown)
		return rmsg(
			"The creation of new updates is disabled at this moment.",
			503
		);

	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	// Validate the request body first
	const result = updateSchema.safeParse(req);
	if (result.success === false)
		return rmsg(result.error.issues[0].message, 400);

	// Find the game
	const gameId = req.game;
	const game = await Game.findOne({ id: gameId });
	if (!game) return rmsg("Attempted to update unknown game", 400);

	const author = user.id;
	if (author !== game.author) return rfu("You didn't make this game", 403);

	const lastUpdateId = await keyv.id("lastUpdateId");

	const update = new Update({
		game: gameId,
		changelog: req.changelog,
		version: req.version,
		name: req.name,
		id: lastUpdateId,
	});

	game.lastUpdate = Date.now();
	await update.save();
	await game.save();

	sendUpdateNotices(req, game);

	return rmsg("Update published! Enjoy the bump.", 201);
}

async function sendUpdateNotices(req: any, game: IGame) {
	const faves = await Favorite.find({ game: req.game });
	let content = "";
	if (req.name && req.version) content = `${req.name} - ${req.version}`;
	else if (req.name) content = req.name;
	else if (req.version) content = req.version;

	if (content !== "") content += "\n\n";
	content += req.changelog;

	content += `\n\n[play it here](/play/${game.id})`;

	faves.forEach(async fave => {
		const msg = new Message({
			from: -1,
			to: fave.user,
			title: `${game.name} was updated`,
			content,
		});

		await msg.save();
	});
}
