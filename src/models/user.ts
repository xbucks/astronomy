import "../helper/database-init";

import { Schema, model } from "mongoose";
import type { IUser } from "../types";
import { env } from "../helper/env";
import jwt from "jsonwebtoken";
import { randomString } from "../helper/random";
import { z } from "zod";

const UserSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: true,
			minLength: 3,
			maxLength: 28,
		},
		email: {
			type: String,
			required: true,
			minLength: 5,
			maxLength: 255,
			unique: true,
		},
		emailVerified: {
			type: Schema.Types.Mixed,
			default() {
				return randomString(32);
			},
		},
		password: {
			type: String,
			required: true,
		},
		id: Number,
		pfpTimestamp: Number,

		bio: {
			type: String,
			maxLength: 1024,
			default: "",
		},

		flairs: {
			type: [String],
			default: ["none"],
		},
		equippedFlair: {
			type: String,
			default: "none",
		},

		playMinutes: {
			type: Number,
			default: 0,
		},
		lastHeartbeat: {
			type: Number,
			default: 0,
		},

		// OK, here's how this works.
		// since you can't exactly "revoke" JWTs, i store
		// a number in them to make sure that when someone logged out all instances,
		// or changes their password, every single instance gets logged out.
		// Well, technically they still have the cookie.
		// However, the site does not accept it because the state in the JWT is lower then that in the userid
		sessionState: {
			type: Number,
			default: 0,
		},

		// Administrator stuff :)
		// 0: User
		// 1: Mod
		// 2: Admin
		// 3: Owner
		modLevel: {
			type: Number,
			default: 0,
		},
		banned: {
			type: Schema.Types.Mixed,
			default: false,
		},
		muted: {
			type: Boolean,
			default: false,
		},
		blockList: {
			type: [Number],
			default: [],
		},

		passwordReset: {
			type: Schema.Types.Mixed,
			default() {
				return false;
			},
		},
		passwordResetExpiry: {
			type: Number,
			default: 0,
		},
	},
	{
		toJSON: {
			transform(doc, ret, _options) {
				delete ret.password;
				delete ret.passwordReset;
				delete ret.passwordResetExpiry;
				delete ret.email;
				delete ret.emailVerified;
				delete ret.blockList;
				delete ret.muted;
				delete ret.banned;
				delete ret.sessionState;
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		},
	}
);

export const User = model<IUser>("User", UserSchema);

export function generateAuthToken(user: IUser): string {
	// Get the private key from the config file -> environment variable
	const token = jwt.sign(
		{ id: user.id, state: user.sessionState },
		env.AUTH_SECRET
		// TODO { expiresIn: ??? }
	);
	return token;
}

// TODO type
export function generateTokenHeaders(user: IUser) {
	const token = generateAuthToken(user);
	return {
		"Set-Cookie":
			`token=${token}; Max-Age=${
				1000 * 60 * 60 * 24 * 7 // 1 week
			}; HttpOnly; Path=/; SameSite=Strict` +
			(import.meta.env.PROD ? "; Secure" : ""),
	};
}

// God, I hate Gmail. I doubt anyone OOTL will ever read this comment, but I need
// to vent to future generations maintaining this codebase. Basically the reason
// this whole function exists is Gmail. Someone thought it would be a good idea
// to bot playtime for one of my games, and the way that they made multiple
// accounts was using Gmail.
// ---
// In Gmail, there are approx. INFINITE addresses that people can send mail to
// where it still reaches your inbox. If you have a dot (.) anywhere in the name
// or an alias (+xyz), then it always gets directed to your inbox.
// ---
// Why is this a thing? I dunno! Because fuck me! I'm tired!
export async function fromEmail(email: string) {
	const user = await User.findOne({ email });
	if (user) return user;

	const filteredEmail = email
		.split(/\.(?=.*@g(?:oogle)?mail.com$)|\+.*(?=@g(?:oogle)?mail.com)/i)
		.join("");
	// Don't waste a query if it'll be the same thing
	if (email === filteredEmail) return null;
	return await User.findOne({ email: filteredEmail });
}

// Function to validate user
export const userSchema = z.object({
	name: z
		.string()
		.min(3, "Your username must be at least 3 characters")
		.max(28, "Your username must be 28 characters or less")
		.regex(
			/^[a-zA-Z0-9\-_]+$/,
			"Your username can only include letters, numbers, dashes, and underscores"
		),
	email: z.string().max(255).email("Your email address is not a valid email"),
	password: z
		.string()
		.min(3, "Your password sucks (minimum length: 3 characters)")
		.max(128, "Your password can not be longer than 128 characters"),
});
