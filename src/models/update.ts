import { Schema, model } from "mongoose";
import type { IUpdate } from "../types";
import { z } from "zod";

const UpdateSchema = new Schema<IUpdate>(
	{
		game: Number,
		id: Number,
		changelog: {
			type: String,
			minLength: 1,
			maxLength: 8192,
			required: true,
		},
		name: {
			type: String,
			maxLength: 128,
			required: false,
		},
		version: {
			type: String,
			maxLength: 32,
			required: false,
		},
	},
	{
		timestamps: true,
	}
);

export const Update = model<IUpdate>("Updates", UpdateSchema);

export const updateSchema = z.object({
	changelog: z.string().min(1).max(8192),
	version: z.string().max(32).optional(),
	name: z.string().max(128).optional(),
	game: z.number().gt(0).int(),
});
