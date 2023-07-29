import { rfu, rmsg } from "../../../../helper/res";
import type { APIContext } from "astro";
import { Game } from "../../../../models/game";
import { GameSave } from "../../../../models/gamesave";

export async function post({ locals, request }: APIContext) {
	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	if (isNaN(req.game) || typeof req.game !== "number")
		return rmsg("Invalid game", 400);

	if (isNaN(req.slot) || typeof req.slot !== "number") req.slot = 0;
	if (!Number.isInteger(req.slot) || req.slot > 10 || req.slot < 0)
		return rmsg("Invalid slot", 400);

	const data = req.data?.toString() ?? "";
	if (data.length > 64000)
		return rmsg("Too big. The limit is 64,000 bytes.", 400);

	const label = req.label?.toString() ?? "";
	if (label.length > 32) return rmsg("Label too long.", 400);

	let save = await GameSave.findOne({
		game: req.game,
		user: user.id,
		slot: req.slot,
	});

	const game = await Game.findOne({ id: req.game });
	if (!game) return rmsg("Invalid game", 400);

	if (!save) {
		save = new GameSave({
			user: user.id,
			game: game.id,
			slot: req.slot,
			data,
			label,
		});
	} else {
		save.data = data;
		save.label = label;
	}

	await save.save();

	return rmsg("Save successful");
}
