import { Favorite } from "../../../models/favorite";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { game } = await req.json();

	await Favorite.deleteMany({ game });
});
