import { Schema, model } from "mongoose";
import type { IComment } from "../types";
import type { PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";
import { z } from "zod";

const CommentSchema = new Schema<IComment>(
	{
		game: Number,
		author: Number,
		id: Number,
		content: {
			type: String,
			minLength: 1,
			maxLength: 4096,
			required: true,
		},
		devResponse: {
			type: String,
			minLength: 1,
			maxLength: 8192,
			required: false,
		},
		up: Array,
		down: Array,
		upCount: {
			type: Number,
			default: 0,
		},
		downCount: {
			type: Number,
			default: 0,
		},
		score: {
			type: Number,
			default: 0,
		},
		deleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

CommentSchema.plugin(paginate);

export const Comment = model<IComment, PaginateModel<IComment>>(
	"Comments",
	CommentSchema
);

export const commentSchema = z.object({
	content: z.string().min(1).max(4096),
	game: z.number().min(1).int(),
});
