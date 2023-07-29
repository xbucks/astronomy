<script lang="ts" context="module">
	export interface UsersDetail {
		anon: number;
		names: [number, string, string, number][];
	}

	export type InfoDetail = false | IChannelSafe;
</script>

<script lang="ts">
	import type { IChannelSafe, SocketMessage } from "../types";
	import { alert, report } from "../libgalaxy";
	import { createEventDispatcher, onMount } from "svelte";
	import DateTime from "./DateTime.svelte";
	import Dropdown from "./Dropdown.svelte";
	import Icon from "@iconify/svelte";
	import type { Unsubscribable } from "@trpc/server/observable";
	import UserChip from "./UserChip.svelte";
	import { client } from "../trpc/client";
	import { chat as md } from "../helper/markdown";

	export let channel = "limbo";
	export let height = "75vh";
	export let userId: number | null = null;
	export let fullscreen = false;

	let header: HTMLDivElement;
	let detailedHeader = false;

	const loggedIn = userId != null;
	let messages: {
		mid: string;
		uid: number;
		name: string;
		flair: string;
		pfp: number;
		text: string;
		time: Date;
	}[] = [];
	let messagesEl: HTMLDivElement;
	let composing = "";
	let info: IChannelSafe | null;
	let channelExists = true;
	let unsub: Unsubscribable | undefined;

	let lastHeartbeat = Date.now();

	const dispatcher = createEventDispatcher<{
		users: UsersDetail;
		info: InfoDetail;
	}>();

	export function changeChannel(id: string) {
		channel = id;
		messages = [];
		// Empty users on channel change
		dispatcher("users", { anon: 0, names: [] });
		attemptUnsub();
		unsub = client.onSend.subscribe(
			{ channel },
			{
				onData(data: SocketMessage) {
					if (data.type === "message") {
						const isBottom =
							messagesEl.scrollHeight -
								messagesEl.clientHeight -
								messagesEl.scrollTop <
							10;
						messages.push(data);
						messages = messages;
						setTimeout(() => {
							if (isBottom) messagesEl.scrollTo({ top: 100000 });
						}, 0);
					} else if (data.type === "old-messages") {
						messages = data.messages.reverse();
						setTimeout(() => {
							messagesEl.scrollTo({ top: 100000 });
						}, 0);
					} else if (data.type === "info") {
						if (data.channel === false) {
							channelExists = false;
						} else {
							info = data.channel;
							channelExists = true;
						}
						dispatcher("info", data.channel);
					} else if (data.type === "users") {
						dispatcher("users", data);
					} else if (data.type === "delete") {
						messages = messages.filter(m => m.mid !== data.id);
					}
				},
			}
		);
	}

	function attemptUnsub() {
		unsub?.unsubscribe();
	}

	async function add() {
		if (!loggedIn) document.getElementById("loginEmail").focus();
		else {
			const res = client.send.mutate(composing);
			composing = "";
			const resMsg = await res;
			if (typeof resMsg === "string") alert.error(resMsg);
		}
	}

	function deleteMsg(id: string) {
		client.deleteMsg.mutate(id);
	}

	export async function muteUser(id: number) {
		const res = await client.muteUser.mutate(id);
		if (typeof res === "string") alert.info(res);
	}

	export async function unmuteUser(id: number) {
		const res = await client.unmuteUser.mutate(id);
		if (typeof res === "string") alert.info(res);
	}

	function checkEnter({ key }: KeyboardEvent) {
		if (key === "Enter") add();
	}

	function hideDescriptionHandler(x: PointerEvent) {
		if (!header.contains(x.target as Node)) hideDescription();
	}

	function toggleDescription() {
		detailedHeader ? hideDescription() : showDescription();
	}

	function showDescription() {
		detailedHeader = true;
		document.addEventListener("pointerdown", hideDescriptionHandler);
	}

	function hideDescription() {
		detailedHeader = false;
		document.removeEventListener("pointerdown", hideDescriptionHandler);
	}

	changeChannel(channel);

	function staffSanity(id: number) {
		info.moderators = info.moderators.filter(m => m !== id);
		info.admins = info.admins.filter(m => m !== id);
	}

	export function demote(id: number) {
		staffSanity(id);
		updateStaff();
	}

	export function toMod(id: number) {
		staffSanity(id);
		info.moderators.push(id);
		updateStaff();
	}

	export function toAdmin(id: number) {
		staffSanity(id);
		info.admins.push(id);
		updateStaff();
	}

	export function changeDescription(desc: string) {
		client.description.mutate(desc);
	}

	export async function changeWebhookURL(url: string) {
		if (url.length <= 1000) {
			await client.hookUrl.mutate(url);
			alert.success("URL updated!");
		} else alert.error("Max length of URL is 1000 characters.");
	}

	export async function changeWebhookType(type: "disabled" | "auto") {
		await client.hookType.mutate(type);
		alert.success("Type updated!");
	}

	export async function toggleChannel() {
		await client.toggleChannel.mutate();
	}

	function updateStaff() {
		info = info;
		client.staffChange.mutate({
			mods: info.moderators,
			admins: info.admins,
		});
	}

	$: isStaff =
		info &&
		(info.moderators.includes(userId) ||
			info.admins.includes(userId) ||
			info.owner === userId);

	let isTiny = window.matchMedia("screen and (max-width: 400px)").matches;

	onMount(() => {
		window.addEventListener(
			"resize",
			() =>
				(isTiny = window.matchMedia(
					"screen and (max-width: 400px)"
				).matches)
		);
		// TODO query to get recent messages
		window.addEventListener("focus", () => {
			if (Date.now() - lastHeartbeat > 2 * 60000) changeChannel(channel);
		});

		setInterval(() => {
			client?.heartbeat.query();
			lastHeartbeat = Date.now();
		}, 60000);
	});

	function promptChannel() {
		const newChannel = prompt(
			"Enter a channel ID to go to. Click Cancel to abort."
		);
		if (newChannel == null) return;
		changeChannel(newChannel);
	}
</script>

<div id="message-wrapper" class:fullscreen>
	{#if !fullscreen}
		<button class="toolbar-button left-menu" on:click={promptChannel}>
			<Icon icon="material-symbols:travel-explore" width="18" />
		</button>
		<div class="right-menu">
			<Dropdown openLeft>
				<a
					href="/chat/{channel}"
					class="button"
					target="_blank"
					rel="noreferrer"
				>
					open in full chat view
				</a>
			</Dropdown>
		</div>
	{/if}
	<div id="message-grid" style={"--height:" + height}>
		{#if channel === "limbo"}
			<div id="channel-info" bind:this={header}>
				<h4>limbo</h4>
			</div>
			<div class="error">
				<h1>you're in limbo 😴</h1>
				<p>
					enter a channel ID in the appropriate box to join a channel.
				</p>
			</div>
		{:else if !channelExists}
			<div id="channel-info" bind:this={header}>
				{#if fullscreen}
					<h4>what channel?</h4>
				{:else}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<h4 class="pointer" on:click={promptChannel}>
						click here to change channel
					</h4>
				{/if}
			</div>
			<div class="error">
				<h1>that channel doesn't exist 🤔</h1>
				<p>are you sure you got the ID right?</p>
			</div>
		{:else if info}
			<div
				id="channel-info"
				class:detailed={detailedHeader}
				bind:this={header}
			>
				<h4>{info.name}</h4>
				{#if !detailedHeader}
					<span class="unimportant">&bull;</span>
				{/if}
				<span
					class="description"
					on:keypress={toggleDescription}
					on:click={toggleDescription}
				>
					{info.description}
					{#if detailedHeader && info.description}
						<br />
					{/if}
					{#if detailedHeader || !info.description}
						#{info.id}
					{/if}
				</span>
			</div>
			{#if !info.enabled}
				<div class="error">
					<h1>this channel is disabled 🙅</h1>
					<p>the owner or an administrator has prevented its use.</p>
				</div>
			{:else}
				<div id="messages" bind:this={messagesEl}>
					{#each messages as msg, i}
						<div
							class="message"
							class:message-first={messages[i - 1]?.uid !=
								msg.uid ||
								+messages[i - 1]?.time < +msg.time - 180000}
						>
							{#if (messages[i - 1]?.uid != msg.uid || +messages[i - 1]?.time < +msg.time - 180000) && msg.uid !== -1}
								<UserChip
									id={msg.uid}
									name={msg.name}
									flair={msg.flair}
									pfpTimestamp={msg.pfp}
									small={!fullscreen || isTiny}
								/>
								<DateTime
									unimportant
									date={msg.time}
									small={!fullscreen || isTiny}
								/>
							{/if}
							<div>
								{@html md.renderInline(msg.text, true)}
							</div>
							{#if loggedIn}
								<Dropdown openLeft>
									{#if !isStaff && msg.uid !== userId}
										<button
											on:click={() => report("chat", msg)}
										>
											report to site staff
										</button>
									{/if}
									{#if isStaff || msg.uid === userId}
										<button
											on:click={() => deleteMsg(msg.mid)}
										>
											delete message
										</button>
									{/if}
									{#if isStaff}
										<button
											on:click={() => muteUser(msg.uid)}
										>
											mute user
										</button>
									{/if}
								</Dropdown>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<div id="typing-bar">
				<input
					placeholder={loggedIn
						? "say something nice here..."
						: "sign up to chat"}
					id="typing"
					maxlength="10000"
					disabled={!loggedIn}
					bind:value={composing}
					on:keypress={checkEnter}
				/>
				<button id="send-button" on:click={add}>&gt;</button>
			</div>
		{:else}
			<div id="channel-info" bind:this={header}>
				<h4>loading...</h4>
			</div>
		{/if}
	</div>
</div>

<style scoped>
	#message-wrapper {
		width: 100%;
	}

	.left-menu,
	.right-menu {
		position: absolute;
		z-index: 4;
		top: 0;
		margin: 0;
		padding: 0;
		width: 32px;
		height: 30px;
	}
	:is(.left-menu, .right-menu) :global(svg) {
		vertical-align: -2px;
	}

	.left-menu {
		left: 0;
	}

	.right-menu {
		right: 0;
		background: transparent;
	}

	.right-menu :global(.dropdown > button) {
		width: 32px;
		height: 30px;
		margin: 0;
		background: transparent;
		border-radius: 0 !important;
		box-shadow: none;
	}

	.right-menu :global(.dropdown > button:is(:hover, :focus-visible)) {
		background: var(--background-active-5);
	}

	.right-menu :global(.dropdown > button > svg) {
		font-size: 10px;
	}

	.right-menu :global(.dropdown.open .dropdown-content) {
		top: 34px;
		right: 4px !important;
	}

	#message-grid {
		display: grid;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		grid-template-rows: 30px 1fr 33px;
	}

	.fullscreen #message-grid {
		grid-template-rows: 38px 1fr 41px;
	}

	#channel-info {
		height: calc(100% - 12px);
		max-height: 100%;
		padding: 6px 40px;
		background: var(--background-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		z-index: 3;
		transition:
			background 0.3s,
			box-shadow 0.3s;
	}

	.fullscreen #channel-info {
		height: calc(100% - 20px);
		padding: 10px 12px;
	}

	#channel-info.detailed {
		height: fit-content;
		max-height: calc(var(--height) - 45px);
		overflow-y: auto;
		box-shadow: 0 0 5px #0007;
		background: var(--background-3);
	}

	.fullscreen #channel-info.detailed {
		max-height: calc(var(--height) - 60px);
	}

	#channel-info h4 {
		font-weight: normal;
		display: inline-block;
		margin: 0px;
		margin-block: 0px;
	}
	.description {
		color: #888;
		cursor: pointer;
		text-overflow: ellipsis;
	}
	.detailed .description {
		display: block;
		margin-top: 4px;
		white-space: pre-wrap;
		cursor: initial;
	}
	#message-wrapper:not(.fullscreen) .detailed .description {
		margin-top: 12px;
		margin-inline: -32px;
	}

	#messages {
		margin: 0;
		padding: 8px;
		overflow: auto;
		box-shadow: inset 0 0 5px #0007;
	}

	.fullscreen #messages {
		padding: 12px;
	}

	.message {
		position: relative;
		margin-bottom: 2px;
		word-wrap: break-word;
		padding: 0 2px 1px 2px;
		border-radius: 4px;
		font-family: Inter, sans-serif;
	}

	.fullscreen .message {
		padding: 2px 4px 3px 4px;
	}

	.message:hover {
		background: var(--background-active-2);
		transition: background 0.3s;
	}

	#message-wrapper .message :global(.dropdown) {
		position: absolute;
		margin: 0;
		top: 2px;
		right: 2px;
		display: none;
	}

	#message-wrapper:not(.fullscreen) .message :global(.dropdown) {
		top: 0;
		right: 0;
		width: 22px;
		height: 22px;
	}

	#message-wrapper:not(.fullscreen) .message :global(.dropdown > button) {
		width: 20px;
		height: 20px;
	}

	#message-wrapper:not(.fullscreen) .message :global(.dropdown > button svg) {
		vertical-align: 0.25em !important;
	}

	.message:hover :global(.dropdown),
	.message :global(.dropdown.open) {
		display: inline-block !important;
	}

	.message > div {
		margin: 0;
		padding: 0px 4px 0px 26px;
		overflow: hidden;
	}

	.fullscreen .message > div {
		margin: 0;
		padding: 0px 4px 0px 38px;
	}

	.message > :global(.user-chip) {
		margin: 2px 0 2px 0;
	}
	.fullscreen .message > :global(.user-chip) {
		margin: 2px 0 4px 0;
	}

	.message > :global(span.small) {
		vertical-align: -2px;
	}

	#send-button {
		margin: 0;
		padding: 0;
		width: 25px;
		height: 25px;
	}

	#typing-bar {
		padding: 4px;
		background: var(--background-2);
	}

	.fullscreen #typing-bar {
		padding: 8px;
	}

	#typing {
		padding: 1px 6px;
		border: none;
		width: calc(100% - 42px);
		height: 23px;
		line-height: 23px;
		font-family: Inter, sans-serif;

		background: var(--background-1);
	}

	#typing:hover,
	#typing:focus {
		outline: 1px solid var(--color-active-4);
		transition: outline 0.3s;
	}

	.error {
		margin: auto;
	}

	@media screen and (max-width: 1000px) {
		.fullscreen #channel-info {
			padding-right: 48px;
		}

		.fullscreen #channel-info.detailed h4 {
			display: block;
			margin: -10px -48px -10px -48px;
			transform: translateY(-10px);
			padding: 10px 48px 10px 48px;
			position: sticky;
			top: 0;
			background: var(--background-3);
			transition: background 0.3s;
		}

		.fullscreen #channel-info.detailed .description {
			margin-top: 10px;
			margin-right: -38px;
		}
	}

	@media screen and (max-width: 700px) {
		.fullscreen #channel-info {
			padding-left: 48px;
		}

		.fullscreen #channel-info.detailed {
			max-height: calc(var(--height) * 0.75 - 45px);
		}

		.fullscreen #channel-info.detailed .description {
			margin-left: -38px;
		}
	}

	@media screen and (max-width: 400px) {
		#message-wrapper.fullscreen .message :global(.dropdown) {
			top: 0;
			right: 0;
			width: 22px;
			height: 22px;
		}

		#message-wrapper.fullscreen .message :global(.dropdown > button) {
			width: 20px;
			height: 20px;
		}

		#message-wrapper.fullscreen .message :global(.dropdown > button svg) {
			vertical-align: 0.25em !important;
		}

		.fullscreen .message {
			padding: 0px 4px 1px 4px;
		}

		.fullscreen .message > div {
			padding: 0px 4px 0px 26px;
		}
		.fullscreen .message > :global(.user-chip) {
			margin: 2px 0 2px 0;
		}
		.fullscreen .message > :global(span.small) {
			vertical-align: -2px;
		}
	}
</style>
