<script lang="ts">
	import { alert, json, post } from "../libgalaxy";

	// TODO test every single route
	// users
	///   wipe bio
	///   purge pfp
	//   ban
	//   mute
	//   purge games
	//   purge comments
	//   nuke
	//   hardnuke
	// games
	//   wipe desc/name
	//   purge thumb
	//   purge updates
	//   purge comments
	//   purge ratings
	//   purge favorites
	//   nuke
	// oshit
	//   lock comments
	//   lock games
	//   lock chat
	//   lock updates
	//   lock users
	//   lock feedback
	//   lock inbox
	//   lock inbox
	//   Everything
	//   Un-everything

	let user = 0;
	let game = 0;
	let comment = 0;
	let report = "";

	let polyStart = 0;
	let polyEnd = 0;

	function e(url: string) {
		return () => post(`/api/admin/${url}`, { user, game, comment, report });
	}

	function t(key: string) {
		return () => post(`/api/admin/toggle`, { key });
	}

	async function lockdown() {
		await post(`/api/admin/lockdown`, true);
	}
	async function unlockdown() {
		await post(`/api/admin/lockdown`, false);
	}

	async function p(
		url: string,
		bits: {
			user?: number;
			game?: number;
			comment?: number;
			report?: string;
		}
	) {
		if (bits.user !== undefined) user = bits.user;
		if (bits.game !== undefined) game = bits.game;
		if (bits.comment !== undefined) comment = bits.comment;
		if (bits.report !== undefined) report = bits.report;
		await post(`/api/${url}`, { user, game, comment, report });
	}

	async function dismissReport(id: string) {
		await p("report/dismiss", { report: id });
		reports = reports.filter(r => r._id !== id);
	}

	async function thankDismiss(id: string) {
		await p("report/thank", { report: id });
		dismissReport(id);
	}

	async function polynuke() {
		for (let i = polyStart; i <= polyEnd; i++) {
			await post("/api/admin/hardnukeUser", { user: i });
		}
		alert.success("aye boss");
	}

	let reports = [];
	(async () => {
		const res = await json("/api/report/all");
		reports = res.data;
	})();
</script>

<div id="grid">
	<div>
		<h1>
			Users
			<input type="number" placeholder="User ID" bind:value={user} />
		</h1>
		<button on:click={e("wipeBio")}>Wipe Bio</button>
		<button on:click={e("wipePfp")}>Purge PFP</button>
		<button on:click={e("ban")}>(un)ban</button>
		<button on:click={e("mute")}>(un)mute</button>
		<details>
			<summary>Extreme Actions</summary>
			<button on:click={e("purgeGames")}>Purge Games</button>
			<button on:click={e("purgeUserComments")}>Purge Comments</button>
			<button on:click={e("purgeUserChat")}>Purge Chat Messages</button>
			<button on:click={e("nukeUser")}>Nuke</button>
			<button on:click={e("hardnukeUser")}>HARDNUKE</button>
		</details>
	</div>
	<div>
		<h1>
			Games
			<input type="number" placeholder="Game ID" bind:value={game} />
		</h1>
		<button on:click={e("wipeGameInfo")}>Wipe Description/Name</button>
		<button on:click={e("wipeThumbnail")}>Purge Thumbnail</button>
		<button on:click={e("purgeGameUpdates")}>Purge Updates</button>
		<button on:click={e("purgeGameComments")}>Purge Comments</button>
		<button on:click={e("purgeGameRatings")}>Purge Ratings</button>
		<button on:click={e("purgeGameFaves")}>Purge Favorites</button>
		<button on:click={e("nukeGame")}>NUKE</button>
	</div>
	<div>
		<h1>ohshit</h1>
		<button on:click={t("commentsLocked")}>Toggle new comments</button>
		<button on:click={t("gamesLocked")}>Toggle new games</button>
		<!-- <button on:click={t("chatLocked")}>Toggle chat</button> -->
		<button on:click={t("updatesLocked")}>Toggle new updates</button>
		<button on:click={t("usersLocked")}>Toggle new users</button>
		<button on:click={t("feedbackLocked")}>Toggle game feedback</button>
		<button on:click={t("messagesLocked")}>Toggle new messages</button>
		<button on:click={lockdown}>Lockdown</button>
		<button on:click={unlockdown}>Un-lockdown</button>
		<br />
		<h2>polynuke</h2>
		<input type="number" bind:value={polyStart} placeholder="start UID" />
		to
		<input type="number" bind:value={polyEnd} placeholder="end UID" />
		(inclusive)
		<details>
			<summary>BIG SCARY BUTTON</summary>
			<details>
				<summary>redneck confirmation system</summary>
				<button on:click={polynuke}>the polynuke</button>
			</details>
		</details>
	</div>
	<div id="chat">
		<h1>Chat <input placeholder="Chat ID" /></h1>
	</div>
	<div id="reports">
		<h1>Reports</h1>
		{#each reports as report}
			<p>
				{report.type} / Reporter UID: {report.author} / {report.part} / {report.reason}
			</p>
			{#if report.type === "comment"}
				<pre>Author: {report.data.author}
Game: {report.data.game}
Content: {report.data.content}

Reply?: {report.data.devResponse}</pre>
				<button
					on:click={() =>
						p("admin/deleteComment", { comment: report.data.id })}
					>Delete</button
				>
				<a class="button" href={`/user/${report.data.author}`}
					>Whois (User)</a
				>
				<a class="button" href={`/play/${report.data.game}`}
					>Whois (Game)</a
				>
			{:else if report.type === "game"}
				Author: {report.data.author} / Game: {report.data.id}
				<details>
					<summary>Game JSON</summary>
					{JSON.stringify(report.data)}
				</details>
				<a class="button" href={`/user/${report.data.author}`}
					>Whois (Author)</a
				>
				<a class="button" href={`/play/${report.data.id}`}
					>Whois (Game)</a
				>
				<button on:click={() => (game = report.data.id)}
					>Open in Games</button
				>
			{:else if report.type === "user"}
				<details>
					<summary>User JSON</summary>
					{JSON.stringify(report.data)}
				</details>
				<a class="button" href={`/user/${report.data.id}`}>
					Whois (User)
				</a>
				<button on:click={() => (user = report.data.id)}>
					Open in Users
				</button>
			{:else if report.type === "chat"}
				<details>
					<summary>context (before)</summary>
					{#each report.data.before as msg}
						<a href="/user/{msg.author}">{msg.author}</a>: {msg.content}
						<br />
					{/each}
				</details>
				<details>
					<summary>message</summary>
					{report.data.msg.author}: {report.data.msg.content}
				</details>
				<details>
					<summary>context (after)</summary>
					{#each report.data.after as msg}
						<a href="/user/{msg.author}">{msg.author}</a>: {msg.content}
						<br />
					{/each}
				</details>
				<a class="button" href="/user/{report.data.msg.author}"
					>Whois (Author)</a
				>
				<button on:click={() => (user = report.data.msg.author)}
					>Open in Users</button
				>
			{:else if report.type === "message"}
				<div>
					From: <a href="/user/{report.data.from}"
						>{report.data.from}</a
					><br />
					Title: {report.data.title}
				</div>
				<pre>{report.data.content}</pre>
				<button on:click={() => (user = report.data.from)}
					>Open in Users</button
				>
			{:else}
				<p>wtf (invalid report?)</p>
			{/if}
			|
			<button on:click={() => dismissReport(report._id)}>Dismiss</button>
			<button on:click={() => p("admin/mute", { user: report.author })}
				>Mute Reporter</button
			>
			<button on:click={() => thankDismiss(report._id)}
				>Thank + Dismiss</button
			>
			<hr />
		{/each}
	</div>
</div>

<style>
	#grid {
		display: grid;
		grid-template: repeat(3, 1fr) / repeat(3, 1fr);
		height: calc(100vh - 48px);
	}

	#chat {
		grid-area: 1 / 3 / span 2 / 3;
	}

	#reports {
		grid-area: 2 / 1 / span 2 / span 2;
		overflow: auto;
	}

	#grid > * {
		border: solid 1px #2a2a2a;
	}
</style>
