<script lang="ts" context="module">
	export interface ISize {
		thumb: "small" | "medium" | "large";
		width?: number;
		height?: number;
	}
</script>

<script lang="ts">
	import type { DetailedGameCardWindowWrapper } from "./DetailedGameCard.svelte";
	import type { IGame } from "../types";
	import Icon from "@iconify/svelte";
	import { convertFormat } from "../libgalaxy";
	import formatPlaytime from "../helper/formatPlaytime";

	export let game: IGame;
	export let size: ISize = { thumb: "medium", width: 240 };

	let card: HTMLDivElement;
	let timeout: ReturnType<typeof setTimeout>; // oh yes of course.
	let container: HTMLElement;

	function doPointerEnter(_e: PointerEvent) {
		card.focus();
		timeout = setTimeout(() => {
			(window as DetailedGameCardWindowWrapper).expandGame(
				game,
				container,
				size
			);
		}, 750);
	}

	function doPointerLeave(_e: PointerEvent) {
		clearTimeout(timeout);
	}
</script>

<a bind:this={container} href={`/play/${game.id}`}>
	<div
		class="card"
		class:small={size.thumb === "small"}
		on:pointerenter={doPointerEnter}
		on:pointerleave={doPointerLeave}
		bind:this={card}
		aria-hidden="true"
	>
		<div
			class="thumb"
			style={`background: url("${convertFormat(
				`/thumb/${size.thumb}/`,
				game.id,
				game.thumbTimestamp
			)}")
					no-repeat center center, #0003;
					height: ${size.height === undefined ? "100%; " : `${size.height}px; `}
					width: ${size.width === undefined ? "100%" : `${size.width}px`}`}
		/>
		<div class="down">
			<h3>{game.name}</h3>
			<div class="rating">
				<span>
					<Icon icon="material-symbols:timer" width="16" />
					{formatPlaytime(game.playMinutes)}
					<Icon icon="material-symbols:favorite" width="16" />
					{game.favorites}
				</span>
				<span>
					{game.ratingAvg == 0 ? "---" : game.ratingAvg.toFixed(1)}
					<Icon icon="material-symbols:star" width="16" />
				</span>
			</div>
		</div>
	</div>
	<span class="screenreader">
		{game.name}, {game.ratingCount === 0
			? "no ratings"
			: `${Math.floor(game.ratingAvg * 10) / 10} stars`}, {game.favorites}
		favorite{game.favorites === 1 ? "" : "s"}, {Math.floor(
			game.playMinutes / 60
		)} play hours
	</span>
</a>

<style is:inline>
	a {
		display: block;
		text-decoration: none;
		background: var(--background-2);
		text-decoration-thickness: 0;
		border-radius: 5px;
		box-shadow: 0 0 5px black;
		transition:
			transform 0.2s,
			background 0.2s,
			box-shadow 0.2s,
			opacity 0s;
	}

	.thumb {
		display: inline-block;
		position: relative;
		border-radius: 5px 5px 0 0;

		aspect-ratio: 5 / 3;

		background-size: 101% !important;
		transition: background-size 0.2s;
	}

	a:hover,
	a:focus-visible {
		outline: none;
		background: var(--background-3);
		transform: translateY(-2px);
		box-shadow: 0 2px 10px white;
		position: relative;
		transition:
			transform 0.5s,
			background 0.5s,
			box-shadow 0.5s,
			opacity 0s;
	}

	a:hover .thumb {
		background-size: 120% !important;
		transition: background-size 2s;
	}

	h3 {
		font-family: var(--content-font);
		font-weight: normal;
		margin: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.down {
		padding: 3px 8px;
		height: 40px;
	}

	.down > h3 {
		display: block;
	}

	.rating {
		font-family: var(--content-font);
		float: right;
		font-size: 12px;
	}

	.rating :global(svg) {
		vertical-align: -3px;
	}

	.down > .rating {
		float: none;
	}

	.down > .rating > span:last-child {
		float: right;
	}
</style>
