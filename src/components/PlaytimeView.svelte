<script lang="ts">
	import type { IGame, IPlaytime } from "../types";
	import DateTime from "./DateTime.svelte";
	import GameCard from "./GameCard.svelte";
	import Icon from "@iconify/svelte";
	import formatPlaytime from "../helper/formatPlaytime";

	export let playtimes: IPlaytime[];
	export let games: IGame[];

	const gameObj = {};
	games.forEach(game => {
		gameObj[game.id] = game;
	});

	let sort = "minutes";
	let reversed = false;
	let showAll = false;
	function setSort(type: string) {
		return () => {
			sort = type;
			sortPlaytimes();
		};
	}

	function reverse() {
		reversed = !reversed;
		sortPlaytimes();
	}

	function sortPlaytimes() {
		playtimes = reversed
			? playtimes.sort((a, b) => a[sort] - b[sort])
			: playtimes.sort((a, b) => b[sort] - a[sort]);
	}

	setSort("minutes")();
</script>

<div class="container">
	sort:
	<button class:active={sort === "minutes"} on:click={setSort("minutes")}>
		<Icon icon="material-symbols:timer" inline /> playtime
	</button>
	<button class:active={sort === "updatedAt"} on:click={setSort("updatedAt")}>
		<Icon icon="material-symbols:videogame-asset-outline-rounded" inline /> last
		played
	</button>
	<button class:active={sort === "createdAt"} on:click={setSort("createdAt")}>
		<Icon icon="material-symbols:calendar-month" inline /> first played
	</button>
	<button class:active={reversed} on:click={reverse}>
		<Icon icon="material-symbols:sort-rounded" inline /> reverse order
	</button>
</div>
<br />
<div>
	{#each playtimes as playtime, i (playtime.game)}
		{#if gameObj[playtime.game] !== undefined && (i < 20 || showAll)}
			<div class="playtime-entry">
				<GameCard
					game={gameObj[playtime.game]}
					size={{ thumb: "medium" }}
				/>
				<div class="playtime-stats flex-centervert">
					<div>
						<p class="playtime-hours">
							<Icon
								icon="material-symbols:timer"
								inline
							/>{formatPlaytime(playtime.minutes)}
						</p>
						<p class="time-stats bigscreen unimportant">
							last played <DateTime
								date={playtime.updatedAt}
								style="date"
							/>
							<br />
							first played <DateTime
								date={playtime.createdAt}
								style="date"
							/>
						</p>
						<p class="time-stats smallscreen unimportant">
							last played <DateTime
								date={playtime.updatedAt}
								style="date"
							/> &bull; first played <DateTime
								date={playtime.createdAt}
								style="date"
							/>
						</p>
					</div>
				</div>
			</div>
		{/if}
	{:else}
		<p>...wow, it's quiet.</p>
	{/each}
	<div class="center">
		<button on:click={() => (showAll = !showAll)}>
			{showAll ? "collapse" : "show all"}
		</button>
	</div>
</div>

<style>
	.playtime-entry {
		display: grid;
		grid-template-columns: 240px 1fr;
		margin-bottom: 10px;
		gap: 20px;
	}

	.playtime-stats {
		font-size: 20px;
	}

	.playtime-hours {
		font-size: 32px;
	}

	p {
		margin: 0;
	}

	.active {
		color: var(--color-active-0);
		background: var(--background-active-5);
	}

	.center {
		text-align: center;
	}

	.smallscreen {
		display: none;
	}

	@media screen and (max-width: 500px) {
		.playtime-entry {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr 50px;
			margin-bottom: 16px;
			gap: 10px;
		}

		.playtime-stats {
			font-size: 14px;
		}

		.smallscreen {
			display: block;
		}

		.bigscreen {
			display: none;
		}
	}
</style>
