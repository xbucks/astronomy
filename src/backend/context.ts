import type { IncomingMessage } from "http";
import type { WebSocket } from "ws";
import type { inferAsyncReturnType } from "@trpc/server";
import { tokenToUser } from "../helper/auth";

const parseCookie = (str: string) => {
	if (!str) return {};
	return str
		.split(";")
		.map(v => v.split("="))
		.reduce(
			(
				acc: {
					[key: string]: string;
				},
				v
			) => {
				acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(
					v[1].trim()
				);
				return acc;
			},
			{}
		);
};

let connCount = 0;
export async function createContext({
	req,
}: {
	req: IncomingMessage;
	res: WebSocket;
}) {
	// Create your context based on the request object
	// Will be available as `ctx` in all your resolvers
	// This is just an example of something you might want to do in your ctx fn

	async function getUserFromHeader() {
		if (req.headers.cookie !== undefined) {
			const cookie = parseCookie(req.headers.cookie);
			const user = await tokenToUser(cookie.token);
			if (!user.user) return null;
			if (!user.loggedIn) return null;
			if (user.shouldLogout || user.needsVerification) return null;
			if (user.user.banned !== false) return null;
			if (user.user.muted !== false) return null;
			return user.user;
		}
		return null;
	}

	const user = await getUserFromHeader();
	return {
		user,
		cid: ++connCount,
	};
}

export type Context = inferAsyncReturnType<typeof createContext>;
