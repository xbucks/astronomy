import { Schema, model } from "mongoose";
import type { IPlaytime } from "../types";

const PlaytimeSchema = new Schema<IPlaytime>(
	{
		user: Number,
		game: Number,
		minutes: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

export const Playtime = model<IPlaytime>("Playtime", PlaytimeSchema);
