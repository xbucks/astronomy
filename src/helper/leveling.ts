import type { IUser } from "../types";

export function getXP(user: IUser): number {
	return user.playMinutes;
}

export function getXPToNextLevel(level: number): number {
	return 80 * level + 20 * level * level;
}

export function getLevel(totalXP: number): number {
	return Math.floor((-80 + Math.sqrt(6400 + 80 * totalXP)) / 40) + 1;
}
