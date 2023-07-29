<script lang="ts">
	import type { IGame, IUser } from "../../types";
	import { json, post } from "../../libgalaxy";
	import GameCard from "../GameCard.svelte";
	import UserSearchWidget from "../UserSearchWidget.svelte";

	let loaded = false;
	let data: any = {};

	let leavingNote = 0;
	let noteText = "";
	function openNote(game: IGame) {
		leavingNote = game.id;
		noteText = "";
	}

	async function loadData() {
		const res = await json("/api/admin/housekeepingData");
		console.log(res);
		data = res;
		loaded = true;
	}

	async function verify(game: IGame, status: boolean | string) {
		await post("/api/admin/verifyStatus", { game: game.id, status });
		leavingNote = -1;
		loadData();
	}

	let messageTitle = "";
	let messageContent = "";
	let sendToEveryone = false;
	let sendToUid = 1;

	async function sendMsg() {
		const res = await post("/api/admin/inboxComms", {
			title: messageTitle,
			content: messageContent,
			to: sendToEveryone ? true : sendToUid,
		});

		messageTitle = "";
		messageContent = "";
		sendToEveryone = false;
	}

	let bFound = false;
	let bData = {} as IUser;
	let userSearch: UserSearchWidget;
	const flairs = [
		"tester",
		"gamedev",
		"vip",
		"contributor",
		"donator",
		"admin",
		"mod",
		"owner",
	];

	async function addFlair(flair: string) {
		const { flairs, id } = bData;
		flairs.push(flair);
		await post("/api/admin/setFlairs", { id, flairs });
		userSearch.testUser();
	}

	async function removeFlair(flair: string) {
		let { flairs, id } = bData;
		flairs = flairs.filter(f => f !== flair);
		await post("/api/admin/setFlairs", { id, flairs });
		userSearch.testUser();
	}

	const cannedResponses = [
		`Because of your request, $GAME has been put on galaxy. Thank you so much for taking the time to suggest that we look into it!

Because this is your first time requesting a game, you've been given the \`suggester\` flair. You can equip it at https://galaxy.click/you.`,
		`Because of your request, $GAME has been put on galaxy. Thank you so much for taking the time to suggest that we look into it!`,
		`Thanks for taking the time to make a request!

Unfortunately, $GAME is already on galaxy. If there's any other games you would like to suggest, the form will remain open.`,
		`Thank you for taking the time to make a request!

Unfortunately, $GAME has already been requested, and the developer did not want to post it. If there's any other games you would like to suggest, the form will remain open.`,
		`Thank you for taking the time to make a request!

However, $GAME has already been requested, and we are waiting on a response from the developer. If there's any other games you would like to suggest, the form will remain open.`,
	];

	function draftMessage(type: number, id: number) {
		const { requestAuthor: user, name } = data.requests[id];

		sendToEveryone = false;
		sendToUid = user;
		messageTitle = "Regarding your game request";
		messageContent = cannedResponses[type].replaceAll("$GAME", name);
	}

	async function handleRequest(flair: boolean, id: number) {
		await post("/api/admin/gameRequest", {
			oid: data.requests[id]._id,
			flair,
		});

		loadData();
	}

	loadData();
</script>

{#if loaded}
	<div>
		<h1>welcome to housekeeping 🧹</h1>

		<h2>verification 👁</h2>
		{#if data.unverified.length === 0}
			<p>all good 🎉</p>
		{:else}
			<p>
				<b>{data.unverified.length} unverified games</b>
			</p>
			{#each data.unverified as game}
				<div class="card">
					<GameCard {game} />
				</div>
				<button on:click={() => verify(game, true)}>yae 👍</button>
				<button
					on:click={() =>
						post("/api/admin/nukeGame", { game: game.id })}
				>
					nay 👎
				</button>
				<button on:click={() => openNote(game)}>leave note 🤔</button>
				{#if leavingNote === game.id}
					<input
						type="text"
						placeholder="note"
						bind:value={noteText}
					/>
					<button on:click={() => verify(game, noteText)}>
						update status 📤
					</button>
				{/if}
				{#if game.verified !== false}
					<p>Note: {game.verified}</p>
				{/if}
			{/each}
		{/if}

		<h2>reports ⚠</h2>
		{#if data.unresolved.length === 0}
			<p>all good 🎉</p>
		{:else}
			<p>
				<b>{data.unresolved.length} unresolved reports</b>
				<a href="/admin" class="button">go</a>
			</p>
		{/if}

		<h2>benevolence 🎁</h2>
		<UserSearchWidget
			tab="id"
			bind:found={bFound}
			bind:data={bData}
			bind:this={userSearch}
		/>
		{#if bFound}
			<h3>owned flairs</h3>
			{#each bData.flairs as flair}
				<button
					class="flair"
					data-flair={flair}
					on:click={() => removeFlair(flair)}
				>
					{flair}
				</button>
			{/each}
			<h3>unowned flairs</h3>
			{#each flairs.filter(f => !bData.flairs.includes(f)) as flair}
				<button
					class="flair"
					data-flair={flair}
					on:click={() => addFlair(flair)}
				>
					{flair}
				</button>
			{/each}
		{/if}

		<h2>comms 🗣</h2>
		<p>
			title: <input type="text" bind:value={messageTitle} />
			<br />
			send to everyone?
			<input type="checkbox" bind:checked={sendToEveryone} />
			<br />
			{#if !sendToEveryone}
				send to UID: <input type="number" bind:value={sendToUid} />
				<br />
			{/if}
			message:
			<br />
			<textarea bind:value={messageContent} />
			<button on:click={sendMsg}>send</button>
		</p>

		<h2>requests 🙏</h2>
		{#each data.requests as request, i}
			<div>
				<details>
					<summary>{request.name}</summary>
					link:
					<a href={request.link} target="_blank">{request.link}</a>
					<br />
					contact: {request.contact} <br />
					request by
					<a href="/user/{request.requestAuthor}" target="_blank"
						>{request.requestAuthor}</a
					>
					<br />
					{request.also}<br />
					<button on:click={() => handleRequest(true, i)}
						>close (give flair)</button
					>
					<button on:click={() => handleRequest(false, i)}
						>close (no flair)</button
					><br />
					<span>draft messages:</span>
					<button on:click={() => draftMessage(0, i)}
						>put on site (flair)</button
					>
					<button on:click={() => draftMessage(1, i)}
						>put on site (no flair)</button
					>
					<button on:click={() => draftMessage(2, i)}
						>already on site</button
					>
					<button on:click={() => draftMessage(3, i)}
						>dev said no</button
					>
					<button on:click={() => draftMessage(4, i)}
						>working on it</button
					>
				</details>
			</div>
		{:else}
			<p class="unimportant">no</p>
		{/each}
	</div>
{:else}
	<h1>margaret thatcher is dead</h1>
{/if}

<style>
	.card {
		width: 240px;
	}

	textarea {
		width: 100%;
		height: 200px;
	}
</style>
