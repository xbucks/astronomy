import { rdata, rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Comment } from "../../../models/comment";
import { Game } from "../../../models/game";
import { commentSchema } from "../../../models/comment";
import { keyv } from "../../../models/keyv";

export async function post({ locals, request }: APIContext) {
	const isLockdown = await keyv.get("commentsLocked", false);
	if (isLockdown)
		return rmsg(
			"The creation of new comments is disabled at this moment.",
			503
		);

	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();
	if (user.muted !== false) return rfu("You are currently muted.", 403);

	const result = commentSchema.safeParse(req);
	if (result.success === false)
		return rmsg(result.error.issues[0].message, 400);

	const gameId = parseInt(req.game);
	const game = await Game.findOne({ id: gameId });
	if (!game) return rmsg("Attempted to comment on unknown game", 400);
	if (game.verified !== true)
		return rmsg("Attempted to comment on unverified game", 400);

	const author = user.id;

	const lastCommentId = await keyv.id("lastCommentId");

	// TODO limit comments per user per game (10?)
	const comment = new Comment({
		game: gameId,
		author,
		content: req.content,
		id: lastCommentId,
		up: [author],
		upCount: 1,
		down: [],
		score: 1,
	});

	game.comments++;
	await comment.save();
	await game.save();

	return rdata(
		{
			message: "success",
			content: {
				author,
				id: comment.id,
				content: req.content,
				score: 1,
				hidden: false,
				deleted: false,
				createdAt: +comment.createdAt,
				yourVote: 1,

				name: user.name,
				flair: user.equippedFlair,
				pfp: user.pfpTimestamp,
			},
		},
		201
	);
}
