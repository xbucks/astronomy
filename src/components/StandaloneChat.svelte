<script lang="ts">
	import type { IChannel, IUser } from "../types";
	import Chat from "./Chat.svelte";
	import Icon from "@iconify/svelte";
	import UserChip from "./UserChip.svelte";
	import UserSearchWidget from "./UserSearchWidget.svelte";
	import { onMount } from "svelte";

	export let userId: number | null = null;
	export let channel = "limbo";

	let sideTab = "users";
	let userTab = "name";

	let connChannel = channel;

	let chat: Chat;
	let info: IChannel | null = null;
	let users = { anon: 0, names: [] };
	let sortedNameList = [];

	let webhookURL = "";

	let favorites = JSON.parse(
		localStorage.getItem("favorite-chats") ?? "[]"
	) as string[];

	function infoListener({ detail }: CustomEvent) {
		info = detail;
	}

	function userListener({ detail }: CustomEvent) {
		users = detail;
		sortedNameList = users.names
			.filter(
				([id], i) => users.names.findIndex(([id2]) => id === id2) === i
			)
			// @ts-ignore
			.sort(([_, a], [_2, b]) => a > b);
	}

	function changeChannel(pushState = true, toChannel = channel) {
		if (pushState)
			window.history.pushState(
				{ toChannel },
				"galaxy - chat",
				`/chat/${toChannel}`
			);
		chat.changeChannel(toChannel);
		connChannel = toChannel;
		sideTab = "users";
		setView("");
	}

	function checkEnter(e: KeyboardEvent) {
		if (e.key === "Enter") changeChannel();
	}

	function setSideTab(tab: string) {
		return () => (sideTab = tab);
	}

	function setUserSearch(tab: string) {
		return () => (userTab = tab);
	}

	let userFound = false;
	let foundUserData: IUser = {} as IUser;

	function addFave() {
		if (favorites.includes(connChannel)) return;
		favorites.push(connChannel);
		favorites = favorites;
		storeFaves();
	}

	function removeFave(fave: string) {
		favorites = favorites.filter(f => f !== fave);
		storeFaves();
	}

	function storeFaves() {
		localStorage.setItem("favorite-chats", JSON.stringify(favorites));
	}

	onMount(() => {
		if (channel !== "limbo") chat.changeChannel(channel);

		window.addEventListener("popstate", e => {
			channel = e.state.channel;
			changeChannel(false);
		});
	});

	$: isStaff = info
		? info.moderators.includes(userId) ||
		  info.admins.includes(userId) ||
		  info.owner === userId
		: false;

	let chatView = "";

	function setView(view) {
		chatView = view == chatView ? "" : view;
	}
</script>

<div id="chat-grid-holder">
	<div id="chat-grid" class={chatView}>
		<div id="leftbar">
			<input
				placeholder="Channel ID"
				bind:value={channel}
				on:keypress={checkEnter}
			/>
			<button on:click={() => changeChannel(true)}>→</button>
			<h3>your favorites</h3>
			<div id="favorites">
				{#each favorites as fave}
					<div class="favorite">
						<button on:click={() => changeChannel(true, fave)}
							>{fave}</button
						>
						<button on:click={() => removeFave(fave)}>x</button>
					</div>
				{:else}
					<p class="unimportant">
						you have no favorite channels. go make some friends!
					</p>
				{/each}
			</div>
			<button on:click={addFave}>favorite current channel</button>
		</div>
		<div id="center">
			<button
				class="toolbar-button left-view"
				on:click={() => setView("left")}
			>
				<Icon icon="material-symbols:travel-explore" width="24" />
			</button>
			<button
				class="toolbar-button right-view"
				on:click={() => setView("right")}
			>
				<Icon icon="material-symbols:group" width="24" />
			</button>
			<Chat
				bind:this={chat}
				height="calc(100vh - 48px)"
				{userId}
				on:info={infoListener}
				on:users={userListener}
				fullscreen
			/>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="view-back" on:click={() => setView("")} />
		</div>
		<div id="rightbar">
			{#if isStaff}
				<div class="two-grid">
					<button on:click={setSideTab("users")}>users</button>
					<button on:click={setSideTab("mod")}>moderate</button>
				</div>
			{/if}

			{#if sideTab === "users"}
				<div class="title">in chat now:</div>
				{#each sortedNameList as [userId, name, flair, pfpTimestamp]}
					<div>
						<UserChip id={userId} {name} {flair} {pfpTimestamp} />
					</div>
				{/each}
				{#if users.anon > 0}
					<button id="anon-count">
						<Icon
							icon="material-symbols:group"
							color="var(--color-1)"
							width="24"
						/>{users.anon} anonymous
					</button>
				{/if}
			{:else if sideTab === "mod"}
				<details>
					<summary>staff (user IDs)</summary>
					<ul>
						{#each info?.admins as admin}
							<li>{admin} (admin)</li>
						{:else}
							<li>(no administrators)</li>
						{/each}
						{#each info?.moderators as admin}
							<li>{admin} (mod)</li>
						{:else}
							<li>(no moderators)</li>
						{/each}
					</ul>
				</details>
				<details>
					<summary>manage users</summary>
					<span>search user by:</span>
					<UserSearchWidget
						showTabs
						bind:found={userFound}
						bind:data={foundUserData}
					/>
					{#if userFound}
						{#if info?.owner === userId}
							<p>
								<button
									on:click={() =>
										chat.demote(foundUserData.id)}
								>
									demote to user
								</button>
								<button
									on:click={() =>
										chat.toMod(foundUserData.id)}
								>
									make moderator
								</button>
								<button
									on:click={() =>
										chat.toAdmin(foundUserData.id)}
								>
									make administrator
								</button>
							</p>
						{/if}
						<p>
							<button
								on:click={() => chat.muteUser(foundUserData.id)}
							>
								mute user
							</button>
							<button
								on:click={() =>
									chat.unmuteUser(foundUserData.id)}
							>
								unmute user
							</button>
						</p>
					{/if}
				</details>
				<details>
					<summary>channel options</summary>
					<h3>description</h3>
					<textarea bind:value={info.description} />
					<button
						on:click={() =>
							chat.changeDescription(info.description)}
					>
						update description
					</button>
					{#if info.owner === userId}
						<h3>webhook</h3>
						<p>
							you can't view the active webhook URL at this
							moment.
						</p>
						type:
						<button
							on:click={() => chat.changeWebhookType("disabled")}
							>disabled</button
						>
						<button on:click={() => chat.changeWebhookType("auto")}
							>auto</button
						>
						<br />
						<input
							type="text"
							class="tiny-margin-top"
							placeholder="new webhook URL..."
							bind:value={webhookURL}
						/>
						<button
							on:click={() => chat.changeWebhookURL(webhookURL)}
							>set new URL</button
						>
						<h3>disable channel</h3>
						<button on:click={chat.toggleChannel}
							>toggle channel</button
						>
					{/if}
				</details>
				<br />
				<a href="/docs/chat" target="_blank">read the docs</a>
			{/if}
		</div>
	</div>
</div>

<style>
	#chat-grid-holder {
		position: absolute;
		top: 48px;
		bottom: 0;
		left: 0;
		right: 0;

		overflow: hidden;
	}
	#chat-grid {
		display: grid;
		width: 100%;
		height: 100%;
		max-height: 100%;

		grid-template-columns: 300px 1fr 300px;
	}

	#leftbar,
	#rightbar {
		background: var(--background-2);
		padding: 8px;
		overflow-y: auto;
		max-height: 100%;
	}

	#center {
		background: var(--background-1);
		position: relative;
	}

	.two-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		margin-bottom: 8px;
	}

	#anon-count {
		cursor: default;
	}

	#anon-count > :global(svg) {
		width: 26px;
		height: 26px;
		vertical-align: -7px;
		margin: 0 12px 0 -12px;
		border-radius: 3px 0 0 3px;
	}

	.title {
		margin: 2px 0 10px 0;
	}

	summary {
		cursor: pointer;
	}

	textarea {
		background: var(--background-1);
	}

	.tiny-margin-top {
		margin-top: 3px;
	}

	.favorite {
		display: block;
	}

	.view-back {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 3;
		background: var(--background-1);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s;
	}

	.left-view,
	.right-view {
		display: none;
	}

	#center :is(.left-view, .right-view) {
		position: absolute;
		z-index: 4;
		top: 0;
		margin: 0;
		padding: 0;
		width: 42px;
		height: 38px;
	}
	#center :is(.left-view, .right-view) :global(svg) {
		vertical-align: -4px;
	}
	#chat-grid.left #center .left-view,
	#chat-grid.right #center .right-view {
		background: var(--background-2);
	}
	#chat-grid.left #center .left-view:hover,
	#chat-grid.right #center .right-view:hover {
		background: var(--background-active-5);
	}

	#center .left-view {
		left: 0;
	}

	#center .right-view {
		right: 0;
	}

	@media screen and (max-width: 1000px) {
		#chat-grid {
			width: calc(100% + 300px);
			transition: margin-left 0.3s;
		}

		#chat-grid.right {
			margin-left: calc(-300px);
		}

		.right-view {
			display: inline-block;
		}
	}

	@media screen and (max-width: 700px) {
		#chat-grid {
			--view-width: min(300px, calc(100% - 40px));
			width: calc(var(--view-width) * 2 + 100%);
			margin-left: calc(var(--view-width) * -1);
			grid-template-columns: var(--view-width) 1fr var(--view-width);
		}

		#chat-grid.left {
			margin-left: calc(0px);
		}

		#chat-grid.right {
			margin-left: calc(var(--view-width) * -2);
		}

		#chat-grid:is(.left, .right) .view-back {
			opacity: 0.8;
			pointer-events: all;
		}

		.left-view {
			display: inline-block;
		}
	}
</style>
