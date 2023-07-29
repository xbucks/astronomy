import { getLevel, getXP, getXPToNextLevel } from "../../../../helper/leveling";
import { rdata, rfu, rmsg } from "../../../../helper/res";
import type { APIContext } from "astro";
import { Game } from "../../../../models/game";
import { Playtime } from "../../../../models/playtime";
import { User } from "../../../../models/user";

export async function post({ locals, request }: APIContext) {
	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	const req = await request.json();
	if (req == null) return rmsg("Invalid heartbeat", 400);

	const game = await Game.findOne({ id: req.game });
	if (!game) return rmsg("Invalid heartbeat", 400);

	let playtime = await Playtime.findOne({ game: game.id, user: user.id });

	if (!playtime) {
		// First heartbeat for game
		playtime = new Playtime({ game: game.id, user: user.id, minutes: 1 });
	} else {
		if (Date.now() - user.lastHeartbeat < 55 * 1000) {
			return rmsg("Invalid heartbeat", 400);
		}
		// if (playtime.updatedAt)

		// Playtime exists
		playtime.minutes++;
	}

	await User.updateOne(
		{ id: user.id },
		{
			$inc: { playMinutes: 1 },
			lastHeartbeat: Date.now(),
		}
	);
	await Game.findOneAndUpdate({ id: game.id }, { $inc: { playMinutes: 1 } });
	await playtime.save();

	user.playMinutes++;

	const xp = getXP(user);
	const level = getLevel(xp);
	const xpToCurrent = getXPToNextLevel(level - 1);
	const xpToNext = getXPToNextLevel(level);

	return rdata(
		{ level, xp: xp - xpToCurrent, next: xpToNext - xpToCurrent },
		201
	);
}
