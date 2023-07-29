import { rdata, rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Favorite } from "../../../models/favorite";
import { Game } from "../../../models/game";
import { keyv } from "../../../models/keyv";

export async function post({ locals, request }: APIContext) {
	const isLockdown = await keyv.get("feedbackLocked", false);
	if (isLockdown)
		return rmsg("Game feedback is disabled at this moment.", 503);

	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	if (isNaN(req.game) || typeof req.game !== "number")
		return rmsg("Invalid game", 400);

	const game = await Game.findOne({ id: req.game });
	if (!game) return rmsg("Unknown game", 400);

	let fave = await Favorite.findOne({ game: req.game, user: user.id });

	if (fave) {
		// Already favorited, delete it
		await fave.deleteOne();
		game.favorites = await Favorite.countDocuments({ game: game.id });
		await game.save();
		return rdata({
			message: "Favorite removed",
			faved: false,
			faves: game.favorites,
		});
	}

	fave = new Favorite({
		game: req.game,
		user: user.id,
	});
	await fave.save();
	game.favorites = await Favorite.countDocuments({ game: game.id });
	await game.save();

	return rdata({
		message: "Favorite added",
		faved: true,
		faves: game.favorites,
	});
}
