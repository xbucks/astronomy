import { rdata, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Game } from "../../../models/game";

export async function get({ locals, url }: APIContext) {
	if (url.searchParams.get("id") === "sex") return rmsg("Yooo", 418);
	const id = parseInt(url.searchParams.get("id"));

	if (isNaN(id)) return rmsg("Invalid game ID", 400);

	const game = await Game.findOne({ id });
	if (!game) return rmsg("Game not found", 404);

	if (game.private) {
		const { user } = locals.auth;
		if (!user || user.id !== game.author)
			return rmsg("Game not found", 404);
		return rdata({ message: "sshhhh", game });
	} else {
		return rdata({ message: "here u go", game });
	}
}
