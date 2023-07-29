import { rfu, rmsg } from "../../../../helper/res";
import type { APIContext } from "astro";
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

	await GameSave.deleteOne({ game: req.game, slot: req.slot, user: user.id });

	return rmsg("Save deleted");
}
