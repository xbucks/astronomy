import { Schema, model } from "mongoose";
import type { IFavorite } from "../types";

const FavoriteSchema = new Schema<IFavorite>(
	{
		game: Number,
		user: Number,
	},
	{
		timestamps: true,
	}
);

export const Favorite = model<IFavorite>("Favorites", FavoriteSchema);
