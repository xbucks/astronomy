import { Game } from "../../../models/game";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { game } = await req.json();
	const g = await Game.findOne({ id: game });
	g.name = "[removed]";
	g.description = "[removed]";
	await g.save();
});
