import { rdata, rfu, rmsg } from "../../../../helper/res";
import type { APIContext } from "astro";
import { GameSave } from "../../../../models/gamesave";

export async function post({ locals, request }: APIContext) {
	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	if (isNaN(req.game) || typeof req.game !== "number")
		return rmsg("Invalid game", 400);

	const saves = await GameSave.find({
		game: req.game,
		user: user.id,
	});

	const frontendSaves = saves
		.sort((a, b) => a.slot - b.slot)
		.map(save => ({
			game: req.game,
			user: user.id,
			slot: save.slot,
			data: save.data,
			label: save.label,
			time: +save.updatedAt,
		}));

	return rdata({
		message: "Load successful",
		game: req.game,
		user: user.id,
		saves: frontendSaves,
	});
}
