import { Schema, model } from "mongoose";
import type { IRating } from "../types";

const RatingSchema = new Schema<IRating>(
	{
		game: Number,
		author: Number,
		rating: {
			type: Number,
			min: 1,
			max: 5,
		},
	},
	{
		timestamps: true,
	}
);

export const Rating = model<IRating>("Rates", RatingSchema);
