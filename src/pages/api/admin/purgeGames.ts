import { Game } from "../../../models/game";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { user } = await req.json();

	await Game.deleteMany({ author: user });
});
