<script lang="ts">
	import { alert, json, post, report } from "../libgalaxy";
	import { message as md, staffMessage as staffMd } from "../helper/markdown";
	import DateTime from "./DateTime.svelte";
	import Dropdown from "./Dropdown.svelte";
	import type { IUser } from "../types";
	import UserChip from "./UserChip.svelte";
	import { convertFormat } from "../libgalaxy";

	let loading = true;
	let composing = false;
	let messages: any[] = [];
	(async () => {
		const res = await json("/api/messages/list");
		messages = res.messages;
		loading = false;
	})();

	let message: any = false;

	const newmsg = {
		to: 0,
		title: "",
		content: "",
	};

	async function read(id: string) {
		message = "loading";
		const res = await json(`/api/messages/read?id=${id}`);
		if (res.msg) {
			message = res.msg;
			messages.forEach((m, mid) => {
				if (m.id === id) {
					message.fromName = m.fromName;
					message.fromPic = m.fromPic;
					messages[mid].read = true;
				}
			});
		}

		const mcount = messages.reduce((n, m) => (n += !m.read), 0);
		if (mcount === 0) {
			[...document.querySelectorAll(".notif")].forEach(e => e.remove());
		} else {
			[...document.querySelectorAll(".notif")].forEach(
				e => (e.textContent = mcount.toLocaleString())
			);
		}
	}

	async function send() {
		if (!userFound) return alert.error("User not found");
		if (foundUserData.banned !== false) return alert.error("User banned");
		const res = await post("/api/messages/send", newmsg);
		if (res._resCode === 200) {
			composing = false;
			toName = "";
			userFound = false;
			foundUserData = {} as IUser;
			newmsg.to = 0;
			newmsg.title = "";
			newmsg.content = "";
			alert.success("Message sent!");
		}
	}

	async function markAllRead() {
		const res = await json("/api/messages/readAll");

		if (res.message === "done") {
			// Mark all messages as read
			messages = messages.map(m => {
				m.read = true;
				return m;
			});
		}
	}

	async function deleteAllRead() {
		if (confirm("Are you sure you want to delete ALL read messages?")) {
			const res = await json("/api/messages/deleteRead");

			if (res.message === "done") {
				messages = messages.filter(m => !m.read);
			}

			if (!messages.some(m => m.id === message._id)) message = false;
		}
	}

	async function unreadMsg() {
		const res = await json(`/api/messages/unread?id=${message._id}`);

		if (res.message === "done") {
			// Mark the one message as unread
			messages = messages.map(m => {
				if (m.id === message._id) m.read = false;
				return m;
			});
		}
	}

	async function deleteMsg() {
		const res = await json(`/api/messages/delete?id=${message._id}`);

		if (res.message === "done") {
			// Mark the one message as unread
			messages = messages.filter(m => m.id !== message._id);
			message = false;
		}
	}

	function reportMsg() {
		report("message", message);
	}

	let toName = "";
	let userFound = false;
	let foundUserData: IUser = {} as IUser;
	async function testUsername() {
		const res = await json(`/api/users/byName?name=${toName}`);
		if (res.message === "no") {
			userFound = false;
		} else if (res.message === "yes") {
			userFound = true;
			foundUserData = res;
			newmsg.to = res.id;
		}
	}

	const search = new URLSearchParams(window.location.search);
	if (search.has("to")) {
		composing = true;
		toName = search.get("to");
		testUsername();
	}
</script>

<div id="grid">
	<div id="sidebar">
		<h1>your inbox</h1>

		{#if loading}
			<p>
				fetching all your messages.
				<span class="unimportant">thanks for your patience :)</span>
			</p>
		{:else}
			<button on:click={() => (composing = !composing)}>
				{composing ? "hide message composer" : "compose new message"}
			</button>
			{#if messages.length}
				<button on:click={markAllRead}>mark all as read</button>
				<button on:click={deleteAllRead}>
					delete all read messages
				</button>
			{/if}

			{#each messages as message, index}
				{#if message.from === -1}
					<div
						class="sysmsg"
						class:read={message.read}
						class:unread={!message.read}
						on:click={() => read(message.id)}
						on:keydown={() => read(message.id)}
					>
						<p class="message-info">
							<b>{message.fromName}</b><br />
							{message.title}
						</p>
					</div>
				{:else}
					<div
						class="msg"
						class:read={message.read}
						class:unread={!message.read}
						on:click={() => read(message.id)}
						on:keydown={() => read(message.id)}
					>
						<img
							src={convertFormat(
								"/pfp/medium/",
								message.from,
								message.fromPic
							)}
							width="48"
							alt=""
						/>
						<p class="message-info">
							<b>{message.fromName}</b><br />
							{message.title}
						</p>
					</div>
				{/if}
			{:else}
				<p id="nothing" class="unimportant">crickets.</p>
			{/each}
		{/if}
	</div>
	<div id="right-grid">
		<div id="content">
			{#if message === false}
				<div class="flex-centervert flex-centerhoriz" id="no-message">
					<p>click on a message to view it here.</p>
				</div>
			{:else if message === "loading"}
				<p>loading...</p>
			{:else}
				<h1>
					{message.title}
				</h1>
				<DateTime date={new Date(message.createdAt)} />

				<div>
					<span id="align-user-chip">
						<UserChip
							flair="none"
							id={message.from}
							name={message.fromName}
							pfpTimestamp={message.fromPic}
						/>
					</span>
					<Dropdown>
						<button on:click={unreadMsg}>mark as unread</button>
						<button on:click={deleteMsg}>delete</button>
						{#if message.from !== -1}
							<button on:click={reportMsg}>report</button>
						{/if}
					</Dropdown>
				</div>
				<div>
					{#if message.from === -1}
						{@html staffMd.render(message.content)}
					{:else}
						{@html md.render(message.content)}
					{/if}
				</div>
			{/if}
		</div>
		{#if composing}
			<div id="composing">
				<input
					bind:value={toName}
					on:input={testUsername}
					type="text"
					placeholder="to"
				/>
				{#if userFound}
					{#if foundUserData.banned !== false}
						<span class="unimportant">(user banned)</span>
					{:else}
						<UserChip small user={foundUserData} />
					{/if}
				{:else}
					<span class="unimportant">(user not found)</span>
				{/if}
				<br />
				<input
					bind:value={newmsg.title}
					type="text"
					placeholder="subject"
				/>
				<br />
				<textarea
					bind:value={newmsg.content}
					id="composer"
					placeholder="say something nice..."
				/><br />
				<button id="send-btn" on:click={send}>Send</button>
			</div>
		{/if}
	</div>
</div>

<style>
	#grid {
		display: grid;
		grid-template-columns: min(600px, 50vw) 1fr;
		grid-template-areas: "sidebar content";
		height: calc(100vh - 48px);
	}

	#sidebar {
		grid-area: sidebar;
		background: var(--background-2);
		overflow: auto;
	}

	#nothing {
		margin-top: 25px;
		text-align: center;
	}

	#right-grid {
		grid-area: content;
		display: grid;
		grid-template-rows: 1fr 1fr;
		border-left: solid thin var(--background-4);
	}

	#right-grid > #content:only-child {
		grid-row: 1 / span 2;
		max-height: calc(100vh - 48px);
	}

	#content {
		grid-row: 1 / 1;
		overflow: auto;
		max-height: calc(50vh - 24px);
		padding: 8px;
	}

	#no-message {
		text-align: center;
		height: 100%;
	}

	#composing {
		border-top: solid thin var(--background-4);
		grid-row: 2 / 2;
		padding: 8px;
	}

	#composer {
		width: calc(100% - 20px);
		height: 150px;
		font-family: var(--content-font);
	}

	#send-btn {
		width: calc(100% - 6px);
	}

	.msg {
		display: grid;
		grid-template: 48px / 48px 1fr;
		cursor: pointer;
	}

	.msg.unread {
		background: var(--background-red-0);
	}

	.msg.read {
		background: var(--background-1);
	}

	.sysmsg {
		height: 48px;
		cursor: pointer;
	}

	.sysmsg.unread {
		background: var(--background-blue-1);
	}

	.sysmsg.read {
		background: var(--background-blue-0);
	}

	.message-info {
		overflow: hidden;
		display: inline-block;
		margin: 6px;
	}

	#align-user-chip {
		vertical-align: 0.5px;
	}

	@media screen and (max-width: 750px) {
		#grid {
			grid-template-columns: 1fr;
			grid-template-rows: 2fr 3fr;
			grid-template-areas: "sidebar" "content";
			height: calc(100vh - 48px);
		}

		#right-grid {
			border-left: none;
			border-top: solid thin var(--background-4);
		}
	}
</style>
