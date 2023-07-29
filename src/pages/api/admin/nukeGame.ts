import { Comment } from "../../../models/comment";
import { Favorite } from "../../../models/favorite";
import { Game } from "../../../models/game";
import { Rating } from "../../../models/rating";
import { Update } from "../../../models/update";
import { adminRoute } from "../../../helper/admin";
import sharp from "sharp";
import { updateThumbs } from "../../../helper/img";

export const post = adminRoute(async req => {
	const { game } = await req.json();

	const g = await Game.findOne({ id: game });

	const original = g.thumbTimestamp;
	g.thumbTimestamp = Date.now();
	await g.save();

	await Update.deleteMany({ game });
	await Rating.deleteMany({ game });
	await Comment.deleteMany({ game });
	await Favorite.deleteMany({ game });
	await updateThumbs(
		sharp("public/unknown-game.webp"),
		game,
		g.thumbTimestamp,
		original
	);

	await Game.deleteOne({ id: game });
});
