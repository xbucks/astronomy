import { Comment } from "../../../models/comment";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { game } = await req.json();

	await Comment.deleteMany({ game });
});
