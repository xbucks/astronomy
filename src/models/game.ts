import { Schema, model } from "mongoose";
import type { IGame } from "../types";
import type { PaginateModel } from "mongoose";
import { allValidTags } from "../helper/tags";
import paginate from "mongoose-paginate-v2";
import { z } from "zod";

function validateTags(tags: string[]) {
	if (tags.length > 30) return false;
	return allValidTags(tags);
}

const GameSchema = new Schema<IGame>(
	{
		name: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 128,
			unique: true,
		},
		type: {
			type: String,
			enum: ["iframe"],
			default: "iframe",
		},
		link: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 256,
			unique: true,
			// TODO: maybe validate as a URI?
		},
		description: {
			type: String,
			maxLength: 8192,
		},
		author: Number,
		id: Number,

		// Ratings:
		// ratingCount: the # of ratings
		// ratingValue: the total # of stars
		// ratingAvg: (value / count)
		// sortRating: (value + 6) / (count + 2)
		//  ^^^ This essentially works by factoring in a 1-star and 5-star review
		ratingCount: {
			type: Number,
			default: 0,
		},
		ratingAvg: {
			type: Number,
			default: 0,
		},
		ratingValue: {
			type: Number,
			default: 0,
		},
		sortRating: {
			type: Number,
			default: 0,
		},

		comments: {
			type: Number,
			default: 0,
		},

		// Game tags
		tags: {
			type: [String],
			default: [],
			validate: [validateTags, "Too many (or invalid) tags"],
		},

		// TODO this is unused. either use it, or drop it!
		// is there a good way to track views in mongo? maybe you could do that!
		plays: {
			type: Number,
			default: 0,
		},

		// Visibility
		unlisted: { type: Boolean, default: false },
		private: { type: Boolean, default: false },

		// Chat
		chatEnabled: { type: Boolean, default: false },

		// Updates
		lastUpdate: { type: Number, default: Date.now },

		// Favorites
		favorites: { type: Number, default: 0 },

		// "Play minutes" tracking
		playMinutes: {
			type: Number,
			default: 0,
		},

		// Game verification
		verified: {
			type: Schema.Types.Mixed,
			default: false,
		},

		thumbTimestamp: Number,
	},
	{
		timestamps: true,
	}
).index({
	name: "text",
	description: "text",
});

GameSchema.plugin(paginate);

export const Game = model<IGame, PaginateModel<IGame>>("Game", GameSchema);

export const gameSchema = z.object({
	name: z
		.string()
		.min(3, "Game name must be at least 3 characters")
		.max(128, "Game name must be 128 characters or less"),
	// type: z.enum(["iframe"]).optional(),
	link: z
		.string()
		.min(3, "Game link must be at least 3 characters")
		.max(256, "Game link must be 256 characters or less")
		.url(),
	description: z
		.string()
		.max(8192, "Game description must be 8192 characters or less")
		.optional(),
	owner: z.literal(true, {
		errorMap: () => ({
			message: "You must be the creator of a game to post it on Galaxy",
		}),
	}),
	unlisted: z.boolean().default(false),
	private: z.boolean().default(false),
});

export const editGameSchema = gameSchema.partial();
