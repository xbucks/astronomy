<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import GameCard from "./GameCard.svelte";
	import type { IGame } from "../types";
	import type { ISize } from "./GameCard.svelte";

	export let games: IGame[];
	export let title = "";
	export let size: ISize = { thumb: "small", width: 240 };
	export let link = "";

	let scroller: HTMLDivElement;
	let scrollY = 0;
	let isEnd = false;

	function scroll(amt: number, smooth = true) {
		const height = scroller.clientHeight + 10;
		scroller.scrollTo({
			top: (Math.round(scroller.scrollTop / height) - amt) * height,
			behavior: smooth ? "smooth" : undefined,
		});
	}

	// This stupid as fuck ngl
	const interval = setInterval(() => {
		// Browser-only shim
		if (typeof process !== "undefined" || typeof scroller === "undefined")
			return;
		scrollY = scroller.scrollTop;
		// TODO make this pretty
		const pxTilEnd = -(
			scrollY -
			(scroller.scrollHeight - scroller.clientHeight)
		);
		isEnd = pxTilEnd < 45;
	}, 50);

	function updateHeight() {
		scroller.style.height = `${scroller.children[0]?.clientHeight}px`;
		scroll(0, false);
	}

	onMount(() => {
		scroller.classList.remove("hidden");
		scroller.scrollTo(0, 0);
		if (typeof window !== "undefined")
			window.addEventListener("resize", updateHeight);
		updateHeight();
	});

	onDestroy(() => {
		clearInterval(interval);
		if (typeof window !== "undefined")
			window.removeEventListener("resize", updateHeight);
	});
</script>

{#if link}
	<h2><a class="masked-link" href={link}>{title}</a></h2>
{:else}
	<h2>{title}</h2>
{/if}
<div class="gamelist">
	<div
		bind:this={scroller}
		style={`--width: ${size.width}px`}
		class="scroller hidden"
	>
		{#each games as game, id (id)}
			<span>
				<GameCard {game} size={{ thumb: size.thumb }} />
			</span>
		{/each}
	</div>
	<!-- These buttons can be hidden for screen readers because you can tab-nav your way aroudn them -->
	{#if !isEnd}
		<button on:click={() => scroll(-1)} class="moveright" aria-hidden="true"
			>&DownArrow;</button
		>
	{/if}
	{#if scrollY > 15}
		<button on:click={() => scroll(1)} class="moveleft" aria-hidden="true"
			>&UpArrow;</button
		>
	{/if}
</div>

<style>
	h2 {
		font-size: 2em;
	}

	.gamelist {
		position: relative;
		margin: -10px 0 0 0;
	}

	.scroller {
		display: grid;
		scroll-snap-type: y mandatory;
		grid-template-columns: repeat(
			auto-fill,
			minmax(min(var(--width), 100%), 1fr)
		);
		padding: 10px 10px;
		margin: 0 -10px;
		gap: 5px;

		width: 100%;
		height: 1fr;
		overflow: hidden;
		white-space: nowrap;
	}

	.scroller.hidden {
		height: 200px;
	}

	.scroller.hidden > * {
		display: none;
	}

	.scroller::-webkit-scrollbar {
		display: none;
	}

	.scroller > span {
		display: block;
		margin-bottom: 25px;
	}

	/* TODO compact these classes */
	.moveright {
		position: absolute;
		top: calc(50% - 25px);
		right: max(calc(calc(var(--global-padding) * -1) + 25px), -35px);
		box-shadow: 0 0 10px black;
		height: 50px;
		width: 50px;
		border-radius: 50px;
		cursor: pointer;

		text-decoration: none !important;
		font-size: 20px;
	}

	.moveleft {
		position: absolute;
		top: calc(50% - 25px);
		left: max(calc(calc(var(--global-padding) * -1) + 25px), -35px);
		box-shadow: 0 0 10px black;
		height: 50px;
		width: 50px;
		border-radius: 50px;
		cursor: pointer;

		text-decoration: none !important;
		font-size: 20px;
	}
</style>
