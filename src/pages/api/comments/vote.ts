import { rfu, rmsg } from "../../../helper/res";
import type { APIContext } from "astro";
import { Comment } from "../../../models/comment";

export async function post({ locals, request }: APIContext) {
	const req = await request.json();

	const { user, loggedIn } = locals.auth;
	if (!loggedIn) return rfu();

	// Find the comment
	const commentId = req.id;

	const comment = await Comment.findOne({ id: commentId, deleted: false });
	if (!comment) return rmsg("Attempted to vote on an unknown comment", 400);

	const voter = user.id;
	let type: "up" | "down";
	let other: "up" | "down";

	switch (req.vote) {
		case 1:
			type = "up";
			other = "down";
			break;
		case -1:
			type = "down";
			other = "up";
			break;
		default:
			// If you're using the API & want to retract votes, simply re-use the
			// current vote. Example:
			// Currently: likes comment
			// To un-like, submit 1
			return rmsg("Unknown vote score (expected 1 or -1)", 400);
	}

	if (comment[type].includes(voter)) {
		// Retract a vote
		comment[type] = comment[type].filter(id => id !== voter);
		comment[`${type}Count`]--;
	} else if (comment[other].includes(voter)) {
		// Swap the vote
		comment[other] = comment[other].filter(id => id !== voter);
		comment[`${other}Count`]--;

		comment[`${type}Count`]++;
		comment[type].push(voter);
	} else {
		// First time voting on comment
		comment[`${type}Count`]++;
		comment[type].push(voter);
	}

	comment.score = comment.upCount - comment.downCount;
	await comment.save();

	return rmsg("success");
}
