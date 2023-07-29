<script lang="ts">
	import type { IFrontendGameSave, IGame } from "../types";
	import { alert, post, promptLogin } from "../libgalaxy";
	import { onDestroy, onMount } from "svelte";
	import Chat from "./Chat.svelte";
	import DateTime from "./DateTime.svelte";

	export let game: IGame;
	export let userId: number | null;

	const loggedIn = userId != null;

	let chatEverOpened = false;
	let height = "75vh";
	let width = "100%";
	let frame: HTMLIFrameElement;
	let chatChannel = `game-${game.id}`;
	let showSaves = false;
	let savesLoaded = false;
	let showCreateSave = false;
	let loadedSaves: IFrontendGameSave[] = [];
	let lastInteraction = Date.now();
	//                   ms   * sc * mn * hrs
	const TWELVE_HOURS = 1000 * 60 * 60 * 12;

	function updateActivity() {
		lastInteraction = Date.now();
	}

	function expand() {
		if (height === "75vh") {
			height = "calc(100vh - 76px)";
			window.scrollTo(0, 0);
			document.body.style.overflow = "hidden";
		} else {
			height = "75vh";
			document.body.style.overflow = "auto";
		}
	}

	function fullscreen() {
		frame.requestFullscreen();
	}

	function toggleSaves() {
		showSaves = !showSaves;
		if (showSaves) refreshSaves();
	}

	function toggleChat() {
		if (!chatEverOpened && !game.chatEnabled)
			chatChannel = prompt(
				"Enter a different chat channel to go to. Click Cancel to abort."
			);
		if (chatChannel == null) return;
		if (width === "100%") width = "calc(100% - 304px)";
		else width = "100%";
		chatEverOpened = true;
	}

	let interval: number;

	onMount(() => {
		document.getElementById("game-filler").remove();

		frame.addEventListener("load", () => {
			sendInfo();
			window.addEventListener("message", messageUp);
			frame.focus();
		});

		frame.addEventListener("keydown", e => {
			if (e.key.includes("Arrow")) e.preventDefault();
		});

		// Events that make you count as "active"
		[
			"mousemove",
			"click",
			"scroll",
			"keypress",
			"touchstart",
			"resize",
		].forEach(e => document.addEventListener(e, updateActivity));

		document.addEventListener("scroll", e => {
			if (height === "75vh") return;
			e.preventDefault();
			window.scrollTo(0, 0);
		});

		if (loggedIn) {
			const holder = document.querySelector("#progress");

			const levelHolder =
				holder.querySelector<HTMLSpanElement>(".level > span");
			const xpHolder =
				holder.querySelector<HTMLSpanElement>(".xp > span");
			const barHolder = holder.querySelector<HTMLDivElement>(".bar");

			const currentHolder =
				holder.querySelector<HTMLSpanElement>(".current") ??
				document.createElement("span");
			currentHolder.classList.add("current");
			holder.append(currentHolder);

			const timerHolder =
				holder.querySelector<HTMLSpanElement>(".timer") ??
				document.createElement("span");
			timerHolder.classList.add("timer");
			currentHolder.append(timerHolder);

			const diffHolder =
				holder.querySelector<HTMLSpanElement>(".diff") ??
				document.createElement("span");
			diffHolder.classList.add("diff");
			currentHolder.append(diffHolder);

			let diff = 0;
			let timer = 60;

			let busy = false;

			interval = setInterval(() => {
				// Skip interaction if window is relatively inactive
				if (Date.now() - TWELVE_HOURS > lastInteraction) {
					timerHolder.innerHTML = "<h3>inactive, not gaining xp</h3>";
					return;
				}
				timer--;
				if (timer <= 0) {
					busy = true;
					timerHolder.innerHTML = "<h3>updating...</h3>";
					timer = 60;

					post(
						"/api/games/playtime/heartbeat",
						{ game: game.id },
						{ errorOnFailure: false }
					)
						.then(xp => {
							if (xp.level) {
								levelHolder.innerText =
									xp.level.toLocaleString("en-US");
								xpHolder.innerText = `${xp.xp.toLocaleString(
									"en-US"
								)} / ${xp.next.toLocaleString("en-US")}`;
								barHolder.style.setProperty(
									"--diff",
									`${(xp.xp / xp.next) * 100}%`
								);
								barHolder.style.setProperty(
									"--progress",
									`${((xp.xp - diff) / xp.next) * 100}%`
								);

								diff++;
							}
							busy = false;
							timerHolder.innerHTML = `<h3>next xp in</h3> ${timer.toLocaleString(
								"en-US"
							)} <span class="screenreader">seconds</span>`;
							diffHolder.innerHTML = `+${diff.toLocaleString(
								"en-US"
							)} <h3>this session</h3>`;
						})
						.catch(_ => {
							busy = false;
							timerHolder.innerHTML = `<h3>next xp in</h3> ${timer.toLocaleString(
								"en-US"
							)}`;
						});
				}

				if (!busy)
					timerHolder.innerHTML = `<h3>next xp in</h3> ${timer.toLocaleString(
						"en-US"
					)}`;
			}, 1000) as unknown as number;
		}

		console.log(
			"%cgalaxy",
			"font-size: 30px;background:#414;color:#eee;padding:20px"
		);
		console.log(
			"%cHEY! %cAre you looking to %ccheat?",
			"color:red",
			"",
			"font-weight:bold"
		);
		console.log(
			"No shame to that. If the game isn't fun, feel free to make it fun!"
		);
		console.log("Unless it's a multiplayer game. In that case, DON'T! D:<");
		console.log(
			"Anyways, if you want some help, try Googling " +
				"'<your browser> iframe change javascript scope'. " +
				"It should give you some clues on how to get to the console for the game."
		);
	});

	onDestroy(() => {
		clearInterval(interval);
		window.removeEventListener("message", messageUp);
	});

	function say(o: any) {
		frame.contentWindow.postMessage(o, game.link);
	}

	async function messageUp(e: MessageEvent) {
		if (e.origin !== new URL(frame.src).origin) {
			console.warn(
				`We received a message from a suspicious URL, so it was ignored.
URL: ${e.origin}
Data: ${e.data}`
			);
			return;
		}
		const msg = e.data;
		if (typeof msg !== "object")
			return alert.error("We received an invalid message from the game.");

		switch (msg.action) {
			case "save": {
				let { slot, data, label } = msg;
				slot ??= 0;

				if (!loggedIn) return say({ ...NO_ACCOUNT_SAVE, slot });

				if (new TextEncoder().encode(data).length > 64000)
					return say({ ...TOO_BIG, slot });

				// TODO: validate/handle too-long label

				if (!Number.isInteger(slot) || slot < 0 || slot > 10)
					return say({ ...INVALID_SLOT_SAVE, slot });

				await post("/api/gapi/saves/set", {
					slot,
					data,
					label,
					game: game.id,
				});
				// TODO handle server error
				return say({ type: "saved", error: false, slot });
			}
			case "load": {
				let { slot } = msg;
				slot ??= 0;

				if (!loggedIn) return say({ ...NO_ACCOUNT_LOAD, slot });

				if (!Number.isInteger(slot) || slot < 0 || slot > 10)
					return say({ ...INVALID_SLOT_LOAD, slot });

				const res = await post("/api/gapi/saves/get", {
					game: game.id,
					slot,
				});

				if (res.data == null) return say({ ...EMPTY_SLOT, slot });

				return say({
					type: "save_content",
					error: false,
					slot,
					content: res.data,
					label: res.label,
				});
			}
			case "save_list": {
				if (!loggedIn) return say(NO_ACCOUNT_LIST);

				const { saves } = await post("/api/gapi/saves/list", {
					game: game.id,
				});
				console.log(saves);

				if (saves === undefined) return say(SERVER_ERROR_LIST);

				const list = {};
				saves.forEach(save => {
					list[save.slot] = {
						content: save.data,
						label: save.label,
					};
				});

				return say({ type: "save_list", error: false, list });
			}
		}
	}

	function sendInfo() {
		// I'LL PARSE THE COOKIES MYSELF, DAMNIT!
		const themeCookie = document.cookie
			.split(";")
			.map(c => c.trim())
			.find(c => c.startsWith("theme="));
		let theme = "none";
		if (themeCookie === "theme=light") theme = "light";
		else if (themeCookie === "theme=dark") theme = "dark";

		say({
			type: "info",
			galaxy: true,
			api_version: 1,
			theme,
			logged_in: loggedIn,
		});
	}

	const SAVE_ERROR = { type: "saved", error: true };
	const TOO_BIG = { ...SAVE_ERROR, message: "too_big" };
	const NO_ACCOUNT_SAVE = { ...SAVE_ERROR, message: "no_account" };
	const INVALID_SLOT_SAVE = { ...SAVE_ERROR, message: "invalid_slot" };
	// const SERVER_ERROR = { ...SAVE_ERROR, message: "server_error" };

	const LOAD_ERROR = {
		type: "save_content",
		error: true,
		content: null,
		label: null,
	};
	const NO_ACCOUNT_LOAD = { ...LOAD_ERROR, message: "no_account" };
	const EMPTY_SLOT = { ...LOAD_ERROR, message: "empty_slot" };
	const INVALID_SLOT_LOAD = { ...LOAD_ERROR, message: "invalid_slot" };

	const LIST_ERROR = {
		type: "save_list",
		error: true,
		list: {},
	};
	const NO_ACCOUNT_LIST = { ...LIST_ERROR, message: "no_account" };
	const SERVER_ERROR_LIST = { ...LIST_ERROR, message: "server_error" };

	function toggleCreateSave() {
		showCreateSave = !showCreateSave;
	}

	async function refreshSaves(skipLoad = false) {
		if (skipLoad) savesLoaded = false;
		const { saves } = await post(
			"/api/gapi/saves/list",
			{
				game: game.id,
			},
			{ errorOnFailure: false }
		);
		if (saves !== undefined) loadedSaves = saves;
		savesLoaded = true;
	}

	function copySave(slot: number) {
		const save = loadedSaves.find(s => s.slot === slot);
		try {
			navigator.clipboard.writeText(save.data);
			alert.success("Copied save!");
		} catch {
			prompt(
				"We could not copy your save automatically. You can find it in this box below:",
				save.data
			);
		}
	}

	// Wrapper func for repetitive /saves/set usage
	async function modifySave(slot: number, data: string, label: string) {
		const res = await post("/api/gapi/saves/set", {
			slot,
			data,
			label,
			game: game.id,
		});
		refreshSaves(true);
		return res;
	}

	let creatingSlot = "";
	let creatingData = "";
	let creatingLabel = "";
	async function createSave() {
		const res = await modifySave(
			parseInt(creatingSlot),
			creatingData,
			creatingLabel
		);

		if (res._resCode === 200) {
			alert.success("Save created!");
			creatingSlot = "";
			creatingData = "";
			creatingLabel = "";
			showCreateSave = false;
		}
	}

	function validateSlot() {
		setTimeout(() => {
			if (creatingSlot === "") return;
			const num = parseFloat(creatingSlot);
			if (isNaN(num)) creatingSlot = "";
			else if (num < 0) creatingSlot = "0";
			else if (num > 10) creatingSlot = "10";
			else creatingSlot = num.toString();
		}, 0);
	}

	// TODO merge these 2 functions?
	async function editSave(slot: number) {
		const newContent = prompt("Enter the new content:");
		if (newContent == null) return;
		const res = await modifySave(
			slot,
			newContent,
			loadedSaves.find(s => s.slot === slot).label
		);
		if (res._resCode === 200) alert.success("Save edited!");
	}

	async function renameSave(slot: number) {
		const newLabel = prompt("Enter the new content:");
		if (newLabel == null) return;
		const res = await modifySave(
			slot,
			loadedSaves.find(s => s.slot === slot).data,
			newLabel
		);
		if (res._resCode === 200) alert.success("Save renamed!");
	}

	async function deleteSave(slot: number) {
		const res = await post("/api/gapi/saves/delete", {
			slot,
			game: game.id,
		});
		if (res._resCode === 200) alert.success("Save deleted!");
		refreshSaves(true);
	}
</script>

<div id="game-view">
	<!-- svelte-ignore a11y-missing-attribute -->
	<iframe
		src={game.link}
		frameborder="0"
		id="game"
		style={`height: ${height}; width: ${width}`}
		allow="clipboard-read; clipboard-write; autoplay; execution-while-not-rendered; execution-while-out-of-viewport; gamepad"
		sandbox="allow-modals allow-pointer-lock allow-scripts allow-downloads allow-orientation-lock allow-popups allow-same-origin"
		bind:this={frame}
	/>
	{#if chatEverOpened}
		<div
			class="chat-holder"
			class:hidden={width === "100%"}
			style="position: relative; display: inline-block"
		>
			<Chat channel={chatChannel} {height} {userId} />
		</div>
	{/if}
</div>
<div id="grid-buttons">
	<!-- TODO This button still allows [Tab] navigation, so it's hidden from screen readers for now -->
	<button on:click={expand} aria-hidden="true"
		>{height === "75vh" ? "expand" : "shrink"}</button
	>
	<button on:click={fullscreen} aria-label="make game fullscreen"
		>fullscreen</button
	>
	<a
		class="button"
		href={game.link}
		target="_blank"
		rel="noreferrer"
		id="newtab"
		aria-label="open original game">open original</a
	>
	<button on:click={toggleSaves} aria-label="toggle cloud save menu"
		>cloud saves</button
	>
	<button on:click={toggleChat}>
		{#if game.chatEnabled}
			{width === "100%" ? "open" : "close"} chat
		{:else}
			chat not enabled
		{/if}
	</button>
</div>
{#if showSaves}
	<div class="flex-centerhoriz">
		<div id="save-menu" class="container">
			{#if loggedIn}
				<h1>
					cloud saves
					<button on:click={toggleCreateSave}>create</button><button
						on:click={() => refreshSaves()}>refresh</button
					>
				</h1>
				{#if showCreateSave}
					<div id="save-creator">
						<p class="unimportant">
							save data should only include exported game saves.
							we are not responsible if your game stops working
							due to inputting bad save data.
						</p>

						<div>
							<input
								type="text"
								placeholder="(save slot)"
								on:input={validateSlot}
								bind:value={creatingSlot}
							/>
							<span class="unimportant">between 0 and 10</span>
						</div>
						<div>
							<input
								type="text"
								placeholder="(save label)"
								bind:value={creatingLabel}
							/>
							<span class="unimportant">optional</span>
						</div>
						<div>
							<input
								type="text"
								placeholder="(paste save data here)"
								bind:value={creatingData}
							/>
						</div>
						<button on:click={createSave}>create save</button>
					</div>
				{/if}
				{#if savesLoaded}
					{#each loadedSaves as save}
						<div class="save">
							<hr />
							<h3 class="nomargin">{save.label}</h3>
							<p class="nomargin">
								slot {save.slot}
								<DateTime
									unimportant
									date={save.time}
									before="•"
								/>
								<br />
								<span class="unimportant">
									{save.data.substring(0, 25)}
								</span>
							</p>
							<button on:click={() => copySave(save.slot)}>
								copy
							</button>
							<button on:click={() => editSave(save.slot)}>
								overwrite
							</button>
							<button on:click={() => renameSave(save.slot)}>
								rename
							</button>
							<button on:click={() => deleteSave(save.slot)}>
								delete
							</button>
						</div>
					{:else}
						<p class="unimportant">
							you have no cloud saves for {game.name}
						</p>
					{/each}
				{:else}
					<p>loading saves...</p>
				{/if}
			{:else}
				<div style="text-align: center">
					<p>
						you need to have an account to cloud save using galaxy.
					</p>
					<button on:click={promptLogin}>log in</button>
					<a class="button" href="/signup">sign up</a>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	#game-view {
		display: flex;
		flex-direction: row;
		position: relative;
	}

	#game {
		/* TODO make this configurable? */
		background: white;
	}

	.chat-holder {
		flex: 0 0 304px;
	}

	#grid-buttons {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		width: 100%;
	}

	#grid-buttons > * {
		border-radius: 0;
		border: 0;
		box-shadow: none;
		text-decoration: none;
		text-align: center;
	}

	.hidden {
		display: none !important;
	}

	#save-menu {
		max-width: min(800px, 80vw);
		margin: 10px;
	}

	#save-creator > div {
		display: block;
		margin-bottom: 3px;
	}

	@media screen and (max-width: 720px) {
		#grid-buttons {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(3, 1fr);
		}

		#newtab {
			grid-area: 2 / 1 / 2 / span 2;
		}
	}
</style>
