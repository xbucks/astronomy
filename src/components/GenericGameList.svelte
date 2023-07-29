<script lang="ts">
	import GameCard from "./GameCard.svelte";
	import GameList from "./GameList.svelte";
	import GameRow from "./GameRow.svelte";
	import type { IGame } from "../types";
	import Icon from "@iconify/svelte";

	export let mode: "cards" | "list" | "rows" = "cards";
	export let games: IGame[];
	export let allowGameList = true;
	export let path = "play";
	export let title = "";
</script>

<h1 class="gamelist-title">
	{title}
	<div class="display-selector">
		<button on:click={() => (mode = "rows")}>
			<Icon
				icon="material-symbols:view-agenda"
				color="var(--color-1)"
				width="24"
			/>
		</button><button on:click={() => (mode = "cards")}>
			<Icon
				icon="material-symbols:grid-view"
				color="var(--color-1)"
				width="24"
			/>
		</button>{#if allowGameList}<button on:click={() => (mode = "list")}>
				<Icon
					icon="material-symbols:view-column-2-rounded"
					color="var(--color-1)"
					width="24"
				/>
			</button>{/if}
	</div>
</h1>
{#if mode === "cards"}
	<div class="gamelist-flex">
		{#each games as game}
			<GameCard {game} size={{ thumb: "medium" }} />
		{/each}
	</div>
{:else if mode === "list" && allowGameList}
	<GameList {games} />
{:else if mode === "rows"}
	<div class="gamelist-rows">
		{#each games as game}
			<GameRow {game} {path} />
		{/each}
	</div>
{/if}

<!--
cards: grid-view
list: view-carousel, view-array
rows: view-agenda (view-day?)
-->
<style>
	.display-selector {
		display: inline-block;
	}

	.display-selector > button {
		background: var(--background-4);
		margin: 0;
		border-radius: 0;
		width: 34px;
		height: 34px;
		padding: 5px 5px;
		cursor: pointer;
		box-shadow: none;
	}

	.display-selector > button:first-child {
		border-radius: 10px 0 0 10px;
	}

	.display-selector > button:last-child {
		border-radius: 0 10px 10px 0;
	}

	.gamelist-flex {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
		gap: 5px;
	}
</style>
