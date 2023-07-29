import type {
	IComment,
	IFrontendComment,
	INamedFrontendComment,
} from "../types";
import { Comment } from "../models/comment";
import { User } from "../models/user";
import { tokenToUser } from "./auth";

function frontendifyComments(
	comments: IComment[],
	userId?: number
): IFrontendComment[] {
	return comments.map(c => ({
		author: c.author,
		id: c.id,
		content: c.content,
		devResponse: c.devResponse,
		score: c.score,
		// TODO: magic number :(
		hidden: c.score <= -5,
		deleted: c.deleted,
		createdAt: c.createdAt,
		// TODO: Hell of a bodge
		// If the user is authenticated, and they have
		// voted on this comment in the past, let them
		// know what their vote on the comment was
		...(userId !== undefined
			? {
					yourVote: c.up.includes(userId)
						? 1
						: c.down.includes(userId)
						? -1
						: 0,
			  }
			: {}),
	}));
}

export async function idToComments(
	gameId: number,
	sort: "createdAt" | "score",
	userId?: number
) {
	// Wow I don't like that
	const comments: IComment[] = await Comment.find({
		game: gameId,
		deleted: false,
	})
		.sort({ [sort]: -1 })
		.limit(5);

	return frontendifyComments(comments, userId);
}

export async function idAndTokenToComments(
	gameId: number,
	sort: "createdAt" | "score",
	token?: string
) {
	const { user, loggedIn } = await tokenToUser(token);
	if (loggedIn) {
		return idToComments(gameId, sort, user.id);
	} else {
		return idToComments(gameId, sort);
	}
}

export async function attachNamesToComments(
	comments: IFrontendComment[]
): Promise<INamedFrontendComment[]> {
	return await Promise.all(
		comments.map(async c => {
			const p = await User.findOne({ id: c.author });
			return {
				name: p.name,
				flair: p.equippedFlair,
				pfp: p.pfpTimestamp,
				...c,
			};
		})
	);
}

export async function paginateComments(
	gameId: number,
	sort: "createdAt" | "score",
	page: number,
	userId?: number
) {
	const paginated = await Comment.paginate(
		{ game: gameId, deleted: false },
		{ sort: "-" + sort, page, limit: 20 }
	);

	const comments = frontendifyComments(paginated.docs, userId);
	const namedComments = await attachNamesToComments(comments);

	return { comments: namedComments, pages: paginated.totalPages };
}
