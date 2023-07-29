import { Game } from "../../../models/game";
import { adminRoute } from "../../../helper/admin";
import sharp from "sharp";
import { updateThumbs } from "../../../helper/img";

export const post = adminRoute(async req => {
	const { game } = await req.json();

	const g = await Game.findOne({ id: game });

	const original = g.thumbTimestamp;
	g.thumbTimestamp = Date.now();
	await g.save();

	await updateThumbs(
		sharp("public/unknown-game.webp"),
		game,
		g.thumbTimestamp,
		original
	);
});
