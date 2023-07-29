import { hasNoDuplicates, oneValidTag } from "../../../helper/tags";
import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
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

	if (!Array.isArray(req.tags)) return rmsg("Tags were not an array", 400);
	if (req.tags.length > 30) return rmsg("Max number of tags is 30", 400);
	if (!hasNoDuplicates(req.tags))
		return rmsg("Duplicate tags are not allowed", 400);

	const invalidTags = req.tags.filter(tag => !oneValidTag(tag));
	if (invalidTags.length)
		return rmsg(`Invlaid tags found: ${invalidTags.join(", ")}`, 400);

	game.tags = req.tags;
	await game.save();

	return rmsg("Tags updated!");
}
