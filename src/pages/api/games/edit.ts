import { Game, editGameSchema } from "../../../models/game";
import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Channel } from "../../../models/channel";
import { Comment } from "../../../models/comment";
import { Favorite } from "../../../models/favorite";
import { Rating } from "../../../models/rating";
import { Update } from "../../../models/update";
import { env } from "../../../helper/env";
import sendWebhook from "../../../helper/sendWebhook";
import sharp from "sharp";
import { updateThumbs } from "../../../helper/img";

export async function post({ locals, request }: APIContext) {
	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	const req = await request.json();

	const game = await Game.findOne({ id: req.id });
	if (!game) return rmsg("Game not found", 400);

	if (game.author !== user.id)
		return rfu("You are not the author of this game", 403);

	if (req.new.name === "" && req.new.link === "") {
		const original = game.thumbTimestamp;
		game.thumbTimestamp = Date.now();
		await game.save();

		await Update.deleteMany({ game: game.id });
		await Rating.deleteMany({ game: game.id });
		await Comment.deleteMany({ game: game.id });
		await Favorite.deleteMany({ game: game.id });
		await updateThumbs(
			sharp("public/unknown-game.webp"),
			game.id,
			game.thumbTimestamp,
			original
		);

		await Game.deleteOne({ id: game.id });

		return rmsg("Game deleted.", 201);
	} else {
		const result = editGameSchema.safeParse(req.new);
		if (result.success === false)
			return rmsg(result.error.issues[0].message, 400);

		if (req.new.name) {
			game.name = req.new.name;
			await Channel.updateOne({
				id: `game-${game.id}`
			}, {
				name: game.name
			})
		}
		if (req.new.description) game.description = req.new.description;

		if (req.new.link) {
			if (game.verified === true && game.link != req.new.link) {
				game.verified = false;
				if (env.STAFF_WEBHOOK)
					await sendWebhook(env.STAFF_WEBHOOK, {
						content: `Updated game ${game.name} needs re-verification:\nhttps://galaxy.click/play/${game.id}\n<https://galaxy.click/admin/housekeeping>`,
					});
			}
			game.link = req.new.link;
		}

		await game.save();

		return rmsg("Updated!", 201);
	}
}
