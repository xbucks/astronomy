import type { AstroCookies } from "astro/dist/core/cookies";
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../types";
import type { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user";
import { env } from "./env";
import jwt from "jsonwebtoken";

// user must be present if "logged in" or requiring verification, but may not be otherwise
export type AuthRequest =
	| {
			user: HydratedDocument<IUser>;
			loggedIn: true;
			needsVerification: false;
			shouldLogout: boolean;
	  }
	| {
			user: HydratedDocument<IUser>;
			loggedIn: false;
			needsVerification: true;
			shouldLogout: boolean;
	  }
	| {
			user?: HydratedDocument<IUser>;
			loggedIn: false;
			needsVerification: false;
			shouldLogout: boolean;
	  };

export async function tokenToUser(
	token?: string,
	keepSecrets = false
): Promise<AuthRequest> {
	if (token !== undefined) {
		const decoded = jwt.verify(token, env.AUTH_SECRET) as JwtPayload;

		const user = await User.findOne({ id: decoded.id });
		if (user) {
			const emailVerified = user.emailVerified;

			if (!keepSecrets) {
				// TODO: AHHHHHH!!!!!
				// @ts-expect-error
				user.password = null;
				// @ts-expect-error
				user.email = null;
				// @ts-expect-error
				user.emailVerified = null;
			}

			if (user.sessionState !== decoded.state)
				return {
					loggedIn: false,
					shouldLogout: true,
					needsVerification: false,
				};
			if (emailVerified !== true)
				return {
					loggedIn: false,
					shouldLogout: false,
					needsVerification: true,
					user,
				};
			if (user.banned !== false)
				return {
					loggedIn: false,
					shouldLogout: false,
					needsVerification: false,
					user,
				};

			return {
				loggedIn: true,
				shouldLogout: false,
				needsVerification: false,
				user,
			};
		} else {
			return {
				loggedIn: false,
				shouldLogout: true,
				needsVerification: false,
			};
		}
	}

	return { loggedIn: false, shouldLogout: false, needsVerification: false };
}

export function astroCookiesToUser(
	cookies: AstroCookies,
	keepSecrets?: boolean
): Promise<AuthRequest> {
	return tokenToUser(cookies.get("token").value, keepSecrets);
}

// You can't check sessionState shtuff without querying the user,
// hence why this function is removed
// export function tokenToId(token: string): {
// 	id: number;
// 	loggedIn: boolean;
// } {
// 	if (token) {
// 		const decoded = jwt.verify(
// 			token,
// 			config.get("secret")
// 		);

// 		return { id: decoded.id, loggedIn: true };
// 	}

// 	return { id: -1, loggedIn: false };
// }
