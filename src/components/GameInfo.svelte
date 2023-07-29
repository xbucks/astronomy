<script lang="ts">
	import RatingWidget, { type RateDetail } from "./RatingWidget.svelte";
	import { convertFormat, post, promptLogin, report } from "../libgalaxy";
	import DateTime from "./DateTime.svelte";
	import Dropdown from "./Dropdown.svelte";
	import type { IGame } from "../types";
	import type { IUpdate } from "../types";
	import Icon from "@iconify/svelte";
	import UpdateDisplay from "./UpdateDisplay.svelte";
	import UserChip from "./UserChip.svelte";
	import { formatDateScreenReader } from "../helper/format";
	import formatPlaytime from "../helper/formatPlaytime";
	import { gameDescription as md } from "../helper/markdown";

	// Name, flair, pfp time
	export let author: [string, string, number];
	export let isDev: boolean;
	export let isLoggedIn: boolean;
	export let game: IGame;
	export let update: IUpdate;
	export let favorited: boolean;
	export let allTags: Record<string, string>;
	export let rating: number;

	const shortTags = game.tags.slice(0, 5);
	let expandTags = false;

	async function favorite() {
		if (!isLoggedIn) {
			promptLogin();
		} else {
			favorited = !favorited;
			if (favorited) game.favorites++;
			else game.favorites--;

			const { faves, faved } = await post("/api/games/favorite", {
				game: game.id,
			});

			game.favorites = faves;
			favorited = faved;
		}
	}

	function copyLink() {
		window.navigator.clipboard.writeText(
			`${window.location.origin}/play/${game.id}`
		);
	}

	function updateRatingCount({ detail }: CustomEvent<RateDetail>) {
		game.ratingCount = detail.count;
		rating = detail.rating;
	}

	function toggleTags() {
		expandTags = !expandTags;
	}
</script>

<h1 id="game-title">
	{game.name}
</h1>
<div id="game-info" class="container">
	<img
		id="game-thumbnail"
		src={convertFormat("/thumb/small/", game.id, game.thumbTimestamp)}
		alt="Thumbnail"
	/>
	<div id="game-summary">
		<table>
			<tr aria-hidden="true">
				<td>
					<h3>{game.author === -1 ? "posted" : "developed"} by</h3>
				</td>
				<td class="favorites-text">
					<h3>favorites</h3>
				</td>
				<td class="rate-bigscreen">
					<h3>
						{game.ratingCount}
						rating{game.ratingCount === 1 ? "" : "s"}
					</h3>
				</td>
			</tr>
			<tr>
				<td>
					<span class="screenreader"
						>{game.author === -1 ? "posted" : "developed"} by</span
					>
					<UserChip
						id={game.author}
						name={author[0]}
						flair={author[1]}
						pfpTimestamp={author[2]}
					/>
				</td>
				<td class="favorites-container">
					<button
						class="heart-container"
						on:click={favorite}
						aria-checked={favorited}
						role="checkbox"
						aria-label="{game.favorites} favorites"
					>
						<Icon
							icon={favorited
								? "material-symbols:favorite"
								: "material-symbols:favorite-outline"}
							color="var(--color-1)"
							width="16"
							style="transform: translate(-2px, 3px); margin-right: 6px"
						/>{game.favorites.toLocaleString()}
					</button>
				</td>
				<td class="rate-bigscreen">
					<RatingWidget
						{game}
						on:rate={updateRatingCount}
						{isLoggedIn}
						{rating}
					/>
				</td>
			</tr>
		</table>
		<div class="rate-smallscreen">
			<h3 aria-hidden="true">
				{game.ratingCount} rating{game.ratingCount === 1 ? "" : "s"}
			</h3>
			<RatingWidget
				{game}
				on:rate={updateRatingCount}
				{isLoggedIn}
				{rating}
				big
			/>
		</div>

		<span class="compact">
			{#if game.tags.length == 0}
				<span class="tag-slot">no tags</span>
			{/if}
			{#each expandTags ? game.tags : shortTags as tag}
				<a
					class="button tag"
					class:custom={!allTags[tag]}
					href="/search?tags={encodeURIComponent(tag)}"
					title={allTags[tag]?.replace("{0}", "This game")}
					aria-label="{tag} tag">{tag}</a
				>
			{/each}
			{#if game.tags.length > 5}
				<button class="icon-button" on:click={toggleTags}>
					<Icon
						icon={expandTags
							? "material-symbols:remove"
							: "material-symbols:add"}
						width="16"
						inline
					/>
				</button>
			{/if}
			<span class="floatright">
				<Dropdown openLeft>
					<button on:click={copyLink}>copy game link</button>
					{#if isDev}
						<a class="button" href={`/edit/${game.id}`}>edit game</a
						>
					{:else if isLoggedIn}
						<button on:click={() => report("game", game)}
							>report game</button
						>
					{/if}
				</Dropdown>
			</span>
		</span>
	</div>
	<div id="game-stats" aria-hidden="true">
		<div>
			<h3>posted</h3>
			<p><DateTime date={new Date(game.createdAt)} style="date" /></p>
		</div>
		<div>
			<h3>updated</h3>
			<p><DateTime date={new Date(game.lastUpdate)} style="date" /></p>
		</div>
		<div>
			<h3>play count</h3>
			<p>coming soon</p>
		</div>
		<div>
			<h3>play-hours</h3>
			<p>
				<Icon icon="material-symbols:timer" width="18" inline />
				{formatPlaytime(game.playMinutes)}
			</p>
		</div>
	</div>
	<p class="screenreader">
		Posted {formatDateScreenReader(new Date(game.createdAt))}. Updated {formatDateScreenReader(
			new Date(game.lastUpdate)
		)}. Has been played for {Math.floor(game.playMinutes / 60)} hours.
	</p>
	<span id="game-details">
		<div>
			<h2>description</h2>
			<hr />
			{@html md.render(game.description)}
		</div>
		{#if update}
			<div>
				<h2>latest update</h2>
				<hr />
				<UpdateDisplay {update} />
				<a
					href={`/updates/${game.id}`}
					id="view-updates"
					class="button"
					target="_blank"
					rel="noreferrer">view all updates</a
				>
			</div>
		{/if}
	</span>
</div>

<style>
	#game-title {
		margin-top: 35px;
		margin-left: 280px;
	}

	#game-info {
		position: relative;
		min-height: 90px;
	}

	#game-info table {
		padding-bottom: 6px;
		width: 100%;
		border-spacing: 0;
		white-space: nowrap;
		gap: 0;
	}
	#game-info table td {
		padding-right: 20px;
	}
	#game-info table td:last-child {
		width: 100%;
		text-align: right;
		padding-right: 0px;
	}
	#game-info table h3,
	#game-info div h3,
	#game-stats > div > h3 {
		padding: 2px 0;
		font-weight: normal;
		font-size: 12px;
		margin-block: 0;
		color: var(--color-4);
	}

	.floatright :global(button) {
		margin-right: 0;
	}

	#game-summary {
		padding-left: 260px;
	}

	#game-thumbnail {
		position: absolute;
		top: -55px;
		left: 10px;
		filter: drop-shadow(1px 0 5px #0007);
	}

	#game-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(160px, 100%), 1fr));
		margin-top: 10px;
		text-align: center;
	}

	#game-stats > div:not(:last-child) {
		border-right: solid thin var(--color-3);
	}

	#game-stats > div > p {
		font-size: 18px;
		font-weight: bold;
		margin: 0;
	}

	#game-details {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
		align-content: center;
		gap: 10px;
	}
	#game-details > div > h2:first-child {
		margin-bottom: 0;
	}
	#game-details #view-updates {
		margin-bottom: 10px;
	}

	/* #rate1 {
		background: linear-gradient(
			90deg,
			#660000 0%,
			#660000 50%,
			#662200 100%
		);
		border-radius: 7px 0 0 7px;
		border-left: solid thin gray;
	}

	#rate5 {
		background: linear-gradient(
			90deg,
			#226600 0%,
			#006600 50%,
			#006600 100%
		);
		border-radius: 0 7px 7px 0;
		border-right: solid thin gray;
	}

	#rate2 {
		background: linear-gradient(
			90deg,
			#662200 0%,
			#664400 50%,
			#665500 100%
		);
	}
	#rate3 {
		background: linear-gradient(
			90deg,
			#665500 0%,
			#666600 50%,
			#556600 100%
		);
	}
	#rate4 {
		background: linear-gradient(
			90deg,
			#556600 0%,
			#446600 50%,
			#226600 100%
		);
	} */

	.rate-smallscreen {
		display: none;
		margin-bottom: 5px;
	}

	@media screen and (max-width: 1000px) {
		#game-thumbnail {
			display: none;
		}

		#game-summary {
			padding-left: 0;
		}

		#game-title {
			margin-left: 0;
		}
	}

	@media screen and (max-width: 720px) {
		.rate-bigscreen {
			display: none;
		}

		.rate-smallscreen {
			display: block;
		}

		#game-summary .favorites-container,
		#game-summary .favorites-text {
			float: right;
			padding-right: 0px;
		}
	}

	@media screen and (max-width: 720px) {
		#game-stats {
			grid-template: repeat(2, 1fr) / repeat(2, 1fr);
		}

		/* This sucks but I have to do it */
		#game-stats > div:not(:last-child) {
			border-right: none;
		}

		#game-stats > div:nth-child(odd) {
			border-right: solid thin var(--color-3);
		}
	}
</style>
