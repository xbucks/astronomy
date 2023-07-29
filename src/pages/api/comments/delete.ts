import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Comment } from "../../../models/comment";

export async function post({ locals, request }: APIContext) {
	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	const commentId = req.id;

	const comment = await Comment.findOne({ id: commentId, deleted: false });
	if (!comment) return rmsg("Attempted to delete an unknown comment", 400);

	// User must be staff or the author of the comment
	if (user.modLevel === 0 && comment.author !== user.id)
		return rfu("You don't have permission to delete this comment!");

	await comment.updateOne({
		deleted: true,
	});

	return rmsg("success", 200);
}
