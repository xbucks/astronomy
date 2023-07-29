import type { HydratedDocument } from "mongoose";
import type { IUser } from "../types";
import { User } from "../models/user";

export async function findUsers(users: number[]) {
	// Remove duplicates
	// TODO i could probably do some one-liner with indexOf and filter
	const userSet: Set<number> = new Set();
	users.forEach(user => userSet.add(user));
	users = [...userSet.keys()];

	const out: Map<number, HydratedDocument<IUser>> = new Map();
	const promises = await Promise.all(
		users.map(async id => await User.findOne({ id }))
	);
	promises.forEach(u => {
		if (u) out.set(u.id, u);
	});

	return out;
}
