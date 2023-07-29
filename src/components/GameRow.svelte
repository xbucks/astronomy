<script lang="ts">
	import type { IGame } from "../types";
	import { convertFormat } from "../libgalaxy";

	export let game: IGame;
	export let path = "play";
</script>

<div class="row">
	<a href={`/${path}/${game.id}`}>
		<div
			class="row-card"
			style={`background: url("${convertFormat(
				"/thumb/small/",
				game.id,
				game.thumbTimestamp
			)}") scroll no-repeat center center, var(--background-2)`}
		>
			<div class="down">
				<div class="rating">
					<span>💚 {game.favorites}</span>
					<span
						>{game.ratingAvg == 0
							? "---"
							: game.ratingAvg.toFixed(1)} ⭐</span
					>
				</div>
			</div>
		</div>
	</a>

	<div class="flex-centervert" style="height: 150px">
		<div>
			<a href={`/${path}/${game.id}`} class="masked-link game-name">
				{game.name}
			</a>
			{#if game.description}
				<p class="desc">{game.description}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: 240px 1fr;
		grid-template-rows: 144px;
		gap: 25px;
	}

	.row:not(:first-child) {
		margin-top: 5px;
	}

	.row-card {
		display: inline-block;
		width: 240px;
		height: 144px;
		position: relative;

		box-shadow: rgba(0, 0, 0, 0.75) 0px -55px 36px -28px inset;
		color: #eee;

		background-size: 100% !important;
		transition:
			background-size ease-out 200ms,
			box-shadow ease-out 200ms,
			text-shadow ease-out 200ms;
	}

	.row-card:hover {
		box-shadow: rgba(0, 0, 0, 0.65) 0px -70px 48px -28px inset;
		background-size: 98% !important;
	}

	.down {
		position: absolute;
		bottom: 8px;
		left: 8px;
		right: 8px;
	}

	.game-name {
		font-size: 25px;
		margin-top: 20px;
		margin-bottom: 20px;
	}

	.desc {
		display: -webkit-box;
		max-width: calc(80vw);
		-webkit-line-clamp: 5;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rating > span:last-child {
		float: right;
	}
</style>
