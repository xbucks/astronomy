import type { IChannel, IChannelSafe, SocketMessage } from "../types";
import { Channel } from "../models/channel";
import { ChatMessage } from "../models/chatmessage";
import { ChatMute } from "../models/chatmute";
import type { Context } from "./context";
import type { HydratedDocument } from "mongoose";
import SuperJSON from "superjson";
import { convertFormat } from "../libgalaxy";
import { createContext } from "./context";
import { findUsers } from "../helper/users";
import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import sendWebhook from "../helper/sendWebhook";
import { z } from "zod";

type UserData = {
	channel: string;
	send(data: SocketMessage): void;
};

type ChannelData = {
	info: HydratedDocument<IChannel>;
	users: string[];
	names: {
		anon: number;
		names: [number, string, string, number][];
	};
};

let anonCount = 0;
const users: Map<string, UserData> = new Map();
const channels: Map<string, ChannelData> = new Map();

function channelSanityFilter(channel: ChannelData, user: string) {
	channel.users = channel.users.filter(u => u !== user);
}

const t = initTRPC.context<Context>().create({
	transformer: SuperJSON,
});

const channelNotFound = observable<SocketMessage>(e => {
	e.next({ type: "info", channel: false });
});

// TODO: include site staff?
function userIsStaff(info: IChannel, id: number): boolean {
	return (
		info.owner === id ||
		info.moderators.includes(id) ||
		info.admins.includes(id)
	);
}

// TODO eughhhhhhhhhhhhh.
export const socketRouter = t.router({
	onSend: t.procedure
		.input(
			z.object({
				channel: z.string().min(1),
			})
		)
		.subscription(async ({ ctx, input }) => {
			// Try to fetch channel from cache
			let channel: ChannelData;
			const foundChannel = channels.get(input.channel);
			if (foundChannel) {
				channel = foundChannel;
			} else {
				// If it's not there, add it
				const channelInfo = await Channel.findOne({
					id: input.channel,
				});
				if (!channelInfo) return channelNotFound;
				channel = {
					users: [],
					info: channelInfo,
					names: { anon: 0, names: [] },
				};
				channels.set(input.channel, channel);
			}

			// if ctx.user is present, the user is logged in
			// otherwise, this is an anon user
			const user = ctx.user;

			// Connection IDs are for people viewing chat.
			//! Chat UID (cid) !== UID (user.id)
			const userString = user ? `user-${ctx.cid}` : `anon-${++anonCount}`;

			// console.log(opts);

			// `resolve()` is triggered for each client when they start subscribing `onAdd`
			// return an `observable` with a callback which is triggered immediately
			return observable<SocketMessage>(emit => {
				const onAdd = (data: SocketMessage) => {
					// emit data to client
					emit.next(data);
				};

				users.set(userString, {
					channel: input.channel,
					send: onAdd,
				});

				if (user) {
					channel.names.names.push([
						user.id,
						user.name,
						user.equippedFlair,
						user.pfpTimestamp,
					]);
				} else {
					channel.names.anon++;
				}

				// Make sure the user isn't already in the channel and then re-add them
				channelSanityFilter(channel, userString);
				channel.users.push(userString);
				broadcast(channel, { type: "users", ...channel.names });

				onAdd({ type: "info", channel: safeInfo(channel.info) });
				sendOldMessages(input, onAdd);

				// unsubscribe function when client disconnects or stops subscribing
				return () => {
					users.delete(userString);
					if (user) {
						// Only remove first match from array
						let foundOne = false;
						channel.names.names = channel.names.names.filter(
							([id]) => {
								if (id === user.id && !foundOne) {
									foundOne = true;
									return false;
								}
								return true;
							}
						);
					} else {
						channel.names.anon--;
					}

					// Kill
					channelSanityFilter(channel, userString);
					broadcast(channel, {
						type: "users",
						...channel.names,
					});
				};
			});
		}),
	send: t.procedure
		.input(z.string().max(10_000))
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) return;

			// Trim whitespace and ignore empty messages
			input = input.trim();
			if (input === "") return;

			const user = users.get(`user-${ctx.cid}`);
			if (!user) return;

			const channel = channels.get(user.channel);
			if (!channel) return;

			// Make sure the channel is enabled
			if (!channel.info.enabled) return "This channel is disabled.";

			// TODO: optimize so we're not querying all mutes when the user sends a message
			// Make sure the user is not muted
			const muteCount = await ChatMute.exists({
				user: ctx.user.id,
				channel: channel.info.id,
				active: true,
			});
			if (muteCount) return "You have been muted in this channel!";

			// Create message
			const message = new ChatMessage({
				content: input,
				author: ctx.user.id,
				channel: channel.info.id,
			});
			await message.save();
			broadcast(channel, {
				type: "message",
				text: input,
				uid: ctx.user.id,
				name: ctx.user.name,
				flair: ctx.user.equippedFlair,
				pfp: ctx.user.pfpTimestamp,
				mid: message._id.toString(),
				time: message.createdAt,
			});

			// Webhooks!
			if (channel.info.webhookType === "auto") {
				await sendWebhook(channel.info.webhookURL, {
					title: `Message from ${ctx.user.name}`,
					content: input,
					name: ctx.user.name + ` (#${channel.info.id})`,
					icon: convertFormat(
						"https://galaxy.click/pfp/medium/",
						ctx.user.id,
						ctx.user.pfpTimestamp
					),
				});
			}

			return {};
		}),
	staffChange: t.procedure
		.input(
			z.object({
				mods: z.array(z.number().int()),
				admins: z.array(z.number().int()),
			})
		)
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) return;

			const user = users.get(`user-${ctx.cid}`);
			if (!user) return;

			const channel = channels.get(user.channel);
			if (!channel) return;

			// Make sure user is owner
			if (channel.info.owner !== ctx.user.id) return;

			// Change staff
			channel.info.moderators = input.mods;
			channel.info.admins = input.admins;
			await channel.info.save();
		}),
	deleteMsg: t.procedure
		.input(z.string())
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) return;

			const user = users.get(`user-${ctx.cid}`);
			if (!user) return;

			const channel = channels.get(user.channel);
			if (!channel) return;

			const message = await ChatMessage.findOne({
				_id: input,
				channel: channel.info.id,
				deleted: false,
			});
			if (!message) return;

			// User must be either staff or the author of the message
			const isStaff = userIsStaff(channel.info, ctx.user.id);
			if (!isStaff && ctx.user.id !== message.author) return;

			// Delete message
			await message.updateOne({
				deleted: true,
			});
			broadcast(channel, {
				type: "delete",
				id: input,
			});
		}),
	muteUser: t.procedure
		.input(z.number().int())
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) return;

			const user = users.get(`user-${ctx.cid}`);
			if (!user) return;

			const channel = channels.get(user.channel);
			if (!channel) return;

			// Make sure user (performing the mute) is staff
			const isStaff = userIsStaff(channel.info, ctx.user.id);
			if (!isStaff) return;

			// Make sure user (being muted) is not staff
			if (userIsStaff(channel.info, input))
				return "User is chat staff and can not be muted";

			// Make sure user isn't already muted
			const muteCount = await ChatMute.countDocuments({
				user: input,
				channel: channel.info.id,
				active: true,
			});
			if (muteCount >= 1) return "User already muted";

			// Create mute
			const mute = new ChatMute({
				user: input,
				staff: ctx.user.id,
				channel: channel.info.id,
			});
			await mute.save();

			return "User muted";
		}),
	unmuteUser: t.procedure
		.input(z.number().int())
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) return;

			const user = users.get(`user-${ctx.cid}`);
			if (!user) return;

			const channel = channels.get(user.channel);
			if (!channel) return;

			// Make sure user is staff
			const isStaff = userIsStaff(channel.info, ctx.user.id);
			if (!isStaff) return;

			// Try to unmute
			const mutes = await ChatMute.updateMany(
				{
					user: input,
					channel: channel.info.id,
					active: true,
				},
				{
					active: false,
				},
				{
					upsert: false,
				}
			);
			if (mutes.modifiedCount === 0) return "User not muted";
			return "User unmuted";
		}),
	description: t.procedure
		.input(z.string().max(8192))
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) return;

			const user = users.get(`user-${ctx.cid}`);
			if (!user) return;

			const channel = channels.get(user.channel);
			if (!channel) return;

			// Make sure user is staff
			const isStaff = userIsStaff(channel.info, ctx.user.id);
			if (!isStaff) return;

			// Change description
			channel.info.description = input;
			await channel.info.save();
			broadcast(channel, {
				type: "info",
				channel: safeInfo(channel.info),
			});
		}),
	hookUrl: t.procedure
		.input(z.string().max(1000).url())
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) return;

			const user = users.get(`user-${ctx.cid}`);
			if (!user) return;

			const channel = channels.get(user.channel);
			if (!channel) return;

			// Make sure user is owner
			if (channel.info.owner !== ctx.user.id) return;

			// Change webhook URL
			channel.info.webhookURL = input;
			await channel.info.save();
		}),
	hookType: t.procedure
		.input(z.literal("disabled").or(z.literal("auto")))
		.mutation(async ({ input, ctx }) => {
			if (!ctx.user) return;

			const user = users.get(`user-${ctx.cid}`);
			if (!user) return;

			const channel = channels.get(user.channel);
			if (!channel) return;

			// Make sure user is owner
			if (channel.info.owner !== ctx.user.id) return;

			// Change webhook type
			channel.info.webhookType = input;
			await channel.info.save();
		}),
	toggleChannel: t.procedure.mutation(async ({ ctx }) => {
		if (!ctx.user) return;

		const user = users.get(`user-${ctx.cid}`);
		if (!user) return;

		const channel = channels.get(user.channel);
		if (!channel) return;

		// Make sure user is owner
		if (channel.info.owner !== ctx.user.id) return;

		// Toggle enabled
		channel.info.enabled = !channel.info.enabled;
		await channel.info.save();
		broadcast(channel, { type: "info", channel: safeInfo(channel.info) });
	}),
	heartbeat: t.procedure.query(async () => {
		return 1;
	}),
});

function broadcast(channel: ChannelData, data: SocketMessage) {
	channel.users.forEach(u => {
		users.get(u)?.send(data);
	});
}

function safeInfo(c: IChannel): IChannelSafe {
	return {
		id: c.id,
		name: c.name,
		description: c.description,
		owner: c.owner,
		admins: c.admins,
		moderators: c.moderators,
		enabled: c.enabled,
	};
}

export type SocketRouter = typeof socketRouter;
export const socketContext = createContext;
// console.log(router._def._config.transformer);

async function sendOldMessages(
	input: { channel: string },
	onAdd: (data: SocketMessage) => void
) {
	// Find old chat messages
	// TODO someone who knows mongo can probably super-optimize this query, and it definitely needs it
	const oldMessages = await ChatMessage.find({
		channel: input.channel,
		deleted: false,
	})
		.sort("-createdAt")
		.limit(50);

	// Attach names to messages
	// since username != user id
	const usersInMessages = await findUsers(oldMessages.map(m => m.author));

	const frontendOldMessages = oldMessages.map(m => {
		// TODO: handle case where the user doesn't exist for some reason
		const userInMessage = usersInMessages.get(m.author);
		return {
			text: m.content,
			uid: m.author,
			mid: m._id.toString(),
			time: m.createdAt,
			name: userInMessage.name,
			flair: userInMessage.equippedFlair,
			pfp: userInMessage.pfpTimestamp,
		};
	});

	onAdd({ type: "old-messages", messages: frontendOldMessages });
}
