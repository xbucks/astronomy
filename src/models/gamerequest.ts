import { Schema, model } from "mongoose";
import type { IGameRequest } from "../types";

const GameRequestSchema = new Schema<IGameRequest>(
	{
		name: String,
		link: String,
		contact: String,
		also: String,
		requestAuthor: Number,
		resolved: {
			type: Boolean,
			default: false,
		},
		successful: {
			type: Boolean,
			default: false,
		},
		note: {
			type: String,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

export const GameRequest = model<IGameRequest>(
	"GameRequests",
	GameRequestSchema
);
