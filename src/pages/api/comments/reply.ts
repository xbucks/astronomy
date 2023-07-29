import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Comment } from "../../../models/comment";
import { Game } from "../../../models/game";
import { Message } from "../../../models/message";

export async function post({ locals, request }: APIContext) {
	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	// Find the comment
	const commentId = req.id;

	const comment = await Comment.findOne({ id: commentId, deleted: false });
	if (!comment) return rmsg("Attempted to reply to an unknown comment", 400);

	const game = await Game.findOne({ id: comment.game });
	if (game.author !== user.id)
		return rfu("You didn't make this game, silly!", 403);

	const reply = req.content;
	if (typeof reply !== "string" || reply === "" || reply.length > 8192)
		return rmsg("Invalid reply (too long or nonexistent)", 400);

	comment.devResponse = reply;
	await comment.save();

	const msg = new Message({
		from: -1,
		to: comment.author,
		title: `A developer replied to your comment on ${game.name}`,
		content: `${user.name} replied to your comment!

Your comment:
> ${comment.content}

${user.name}'${user.name.endsWith("s") ? "" : "s"} reply:
> ${reply}`,
	});
	await msg.save();

	return rmsg("success", 200);
}
