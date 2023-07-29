import { Comment } from "../../../models/comment";
import { adminRoute } from "../../../helper/admin";

export const post = adminRoute(async req => {
	const { comment } = await req.json();

	// TODO: should this Truly Delete or just mark as deleted?
	const commentDoc = await Comment.findOne({ id: comment });
	await commentDoc.deleteOne();
});
