import { Rating } from "../../../models/rating";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { game } = await req.json();

	await Rating.deleteMany({ game });
});
