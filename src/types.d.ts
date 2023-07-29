import type { ObjectId } from "mongoose";

interface IComment {
	id: number;

	// game ID
	game: number;
	// user ID
	author: number;

	content: string;
	devResponse?: string;
	up: number[];
	down: number[];
	upCount: number;
	downCount: number;
	score: number;
	deleted: boolean;

	createdAt: Date;
	updatedAt: Date;
}

interface IFrontendComment {
	id: number;

	// user ID
	author: number;

	content: string;
	devResponse?: string;
	yourVote?: 0 | -1 | 1;
	score: number;
	hidden: boolean;
	deleted: boolean;

	createdAt: Date;
}

interface INamedFrontendComment extends IFrontendComment {
	name: string;
	flair: string;
	pfp: number;
}

interface IGame {
	id: number;

	// user ID
	author: number;

	// information
	type: "iframe";
	link: string;
	name: string;
	description?: string;
	tags: string[];

	// statistics
	favorites: number;
	comments: number;
	playMinutes: number;
	plays: number;

	// ratings
	ratingCount: number;
	ratingAvg: number;
	ratingValue: number;
	sortRating: number;

	// visibility
	verified: boolean | string;
	unlisted: boolean;
	private: boolean;

	// whether chat is enabled
	chatEnabled: boolean;

	// timestamp of last update
	lastUpdate: number;

	// timestamp of last thumbnail update
	thumbTimestamp: number;

	createdAt: Date;
	updatedAt: Date;
}

interface IRating {
	// game ID
	game: number;
	// user ID
	author: number;

	rating: number;

	createdAt: Date;
	updatedAt: Date;
}

interface IUpdate {
	id: number;

	// game ID
	game: number;

	changelog: string;
	name?: string;
	version?: string;

	createdAt: Date;
	updatedAt: Date;
}

// holy shit mongoose ft. ts is ugly af
interface IUser {
	id: number;

	// profile
	name: string;
	bio: string;
	flairs: string[];
	equippedFlair: string;

	// account
	email: string;
	emailVerified: string | true;
	password: string;
	passwordReset: boolean | string;
	passwordResetExpiry: number;

	// moderation
	blockList: number[];
	modLevel: number;
	muted: boolean;
	banned: boolean | string;

	// statistics
	playMinutes: number;

	// session cookie state
	sessionState: number;

	// timestamp of last heartbeat
	lastHeartbeat: number;

	// timestamp of last pfp update
	pfpTimestamp: number;
}

interface IFavorite {
	// game ID
	game: number;
	// user ID
	user: number;

	createdAt: Date;
	updatedAt: Date;
}

// not *that* imessage, dumbass
interface IMessage {
	// user ID of sender
	from: number;
	// user ID of receiver
	to: number;

	title: string;
	content: string;
	read: boolean;
	deleted: boolean;

	createdAt: Date;
	updatedAt: Date;
}

interface IKeyV {
	prop: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- this must store any value
	val: any;
}

interface IReport {
	// user ID
	author: number;

	// part of thing that is bad
	part: string;
	// reason that it's bad
	reason: string;

	// TODO: type this better
	type: string;
	data: any;

	// whether it has been dealt with
	resolved: boolean;

	createdAt: Date;
	updatedAt: Date;
}

interface IPlaytime {
	// user ID
	user: number;
	// game ID
	game: number;

	minutes: number;

	createdAt: Date;
	updatedAt: Date;
}

interface IGameSave {
	// user ID
	user: number;
	// game ID
	game: number;

	slot: number;
	data: string;
	label: string;

	createdAt: Date;
	updatedAt: Date;
}

interface IFrontendGameSave {
	// user ID
	user: number;
	// game ID
	game: number;

	slot: number;
	data: string;
	label: string;

	time: number; // updatedAt
}

// channel info that is public
interface IChannelSafe {
	id: string;

	// information
	name: string;
	description: string;

	// moderation
	owner: number;
	admins: number[];
	moderators: number[];
	enabled: boolean;
}

// channel info + owners only!
interface IChannel extends IChannelSafe {
	webhookURL: string;
	webhookType: "disabled" | "auto";

	// Originally, I was planning to allow for pinned messages.
	// This was scrapped in favor of using the description.
	pinnedMessages: ObjectId[];
}

interface IChatMessage {
	// user ID
	author: number;
	// channel ID
	channel: string;

	content: string;
	deleted: boolean;

	createdAt: Date;
	updatedAt: Date;
}

interface IChatMute {
	// channel ID
	channel: string;

	// user ID of who was muted (the bad guy)
	user: number;
	// user ID of who muted (the staff)
	staff: number;

	// optional reason for mute
	reason?: string;
	// whether the mute is currently active
	active: boolean;

	// timestamp of issuing
	issuedMs: number;
	// timestamp of expiry (-1 if it doesn't expire)
	expiresMs: number;
}

interface IGameRequest {
	// Submission data
	name: string;
	link: string;
	contact: string;
	also: string;
	requestAuthor: number;

	// Should this be shown in the admin panel?
	resolved: boolean;
	// Was this request responsible for the game?
	successful: boolean;
	// Note for other staff
	note: string;
}

type SocketMessage =
	| {
			type: "message";

			// message ID
			mid: string;
			// user ID of author
			uid: number;

			name: string;
			flair: string;
			pfp: number;
			text: string;
			time: Date;
	  }
	| {
			type: "old-messages";
			messages: {
				// message ID
				mid: string;
				// user ID of author
				uid: number;

				name: string;
				flair: string;
				pfp: number;
				text: string;
				time: Date;
			}[];
	  }
	| {
			type: "info";
			channel: IChannelSafe | false;
	  }
	| {
			type: "users";
			anon: number;
			names: [number, string, string, number][];
	  }
	| {
			type: "delete";
			// message ID
			id: string;
	  };
