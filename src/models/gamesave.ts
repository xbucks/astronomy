import { Schema, model } from "mongoose";
import type { IGameSave } from "../types";

const GameSaveSchema = new Schema<IGameSave>(
	{
		game: Number,
		user: Number,
		data: {
			type: String,
			maxLength: 64000,
		},
		slot: Number,
		label: {
			type: String,
			maxLength: 100,
		},
	},
	{
		timestamps: true,
	}
);

export const GameSave = model<IGameSave>("GameSaves", GameSaveSchema);
