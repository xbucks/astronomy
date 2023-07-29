<script lang="ts" context="module">
	export interface RateDetail {
		count: number;
		rating: number;
	}
</script>

<script lang="ts">
	import { post, promptLogin } from "../libgalaxy";
	import type { IGame } from "../types";
	import { createEventDispatcher } from "svelte";

	const dispatcher = createEventDispatcher<{
		rate: RateDetail;
	}>();

	export let game: IGame;
	export let big = false;
	export let isLoggedIn: boolean;
	export let rating: number;

	function rate(stars: number) {
		return async function () {
			if (!isLoggedIn) {
				promptLogin();
				return;
			}
			const newRating = await post(`/api/rate`, {
				id: game.id,
				rating: stars,
			});

			game.ratingAvg = newRating.rating;
			game.ratingCount = newRating.count;
			if (rating === stars) rating = 0;
			else rating = stars;

			dispatcher("rate", {
				count: game.ratingCount,
				rating,
			});
		};
	}
</script>

<div class:big class:rated={rating}>
	<span class="screenreader"
		>rated {game.ratingAvg.toFixed(1)} stars, {game.ratingCount} ratings</span
	>
	<span class="rating" aria-hidden="true">{game.ratingAvg.toFixed(1)}</span>
	<div class="rate-buttons">
		{#each [1, 2, 3, 4, 5] as n}
			<button
				on:click={rate(n)}
				class="rate-{n}"
				class:rate-inactive={rating !== n}
				class:rate-active={rating === n}
				aria-label="rate {n} out of 5">{n}</button
			>
		{/each}
	</div>
</div>

<style>
	.rating {
		font-size: 24px;
		font-weight: bold;
		display: inline-block;
		margin-right: 5px;
		vertical-align: -3px;
	}

	.rate-buttons {
		display: inline-block;
		box-shadow: 1px 0 5px #0007;
		border-radius: 3px;
	}

	.rate-buttons button {
		border-radius: 0;
		box-shadow: none;
		margin: 0;
		width: 32px;
		padding: 0;
		border-left: 1px solid;

		cursor: pointer;
		transition:
			background 0.3s,
			border-color 0.3s;
	}

	.big .rate-buttons button {
		font-size: 16px;
		width: 40px;
		height: 30px;
	}

	.rate-active {
		font-weight: 900;
	}

	button.rate-1 {
		background: #f447;
		border-radius: 3px 0 0 3px;
		border-left: none;
	}
	button.rate-2 {
		background: #f827;
		border-color: #f820;
	}
	button.rate-3 {
		background: #ff07;
		border-color: #ff00;
	}
	button.rate-4 {
		background: #8f17;
		border-color: #8f10;
	}
	button.rate-5 {
		background: #2f27;
		border-color: #2f20;
		border-radius: 0 3px 3px 0;
	}

	:not(.rated) .rate-buttons:not(:hover) button,
	.rated .rate-buttons:not(:hover) button.rate-active ~ button,
	.rate-buttons button:hover ~ button {
		background: var(--background-3);
		border-color: var(--background-5);
	}
</style>
