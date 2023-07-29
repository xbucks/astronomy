import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Channel } from "../../../models/channel";
import { Game } from "../../../models/game";

export async function post({ locals, request }: APIContext) {
	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	const game = await Game.findOne({ id: req.id });
	if (!game) return rmsg("Game not found", 400);
	if (game.author !== user.id)
		return rfu("You are not the author of this game", 403);
	if (game.verified !== true)
		return rmsg("You can not enable chat before a game is verified", 400);
	if (game.chatEnabled === true) return rmsg("Chat is already enabled", 405);

	game.chatEnabled = true;
	const channel = new Channel({
		id: `game-${game.id}`,
		name: game.name,
		owner: game.author,
	});
	await game.save();
	await channel.save();

	return rmsg("Chat enabled!");
}
