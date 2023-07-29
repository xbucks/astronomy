<script lang="ts" context="module">
	export type DetailedGameCardWindowWrapper = Window & {
		isGameCardExpanded?: boolean;
		expandGame?: (game: IGame, card: HTMLElement, size: ISize) => void;
		shrinkGame?: () => void;
	};
</script>

<script lang="ts">
	import type { IGame, IUser } from "../types";
	import { convertFormat, json } from "../libgalaxy";
	import type { ISize } from "./GameCard.svelte";
	import Icon from "@iconify/svelte";
	import UserChip from "./UserChip.svelte";
	import formatPlaytime from "../helper/formatPlaytime";
	//import { gameDescription as md } from "../helper/markdown";
	import { onMount } from "svelte";

	const authors: Map<number, IUser> = new Map();
	let tags: Record<string, string>;

	let isActive = false;
	let isInactive = true;
	let isTrans = false; //🏳️‍⚧️
	let isInfo = false;
	let isLeft = false;

	let currentGame: IGame;
	let currentCard: HTMLElement;
	let currentSize: ISize;
	let currentAuthor = "";
	let currentFlair = "none";
	let currentPic: number | undefined = undefined;
	const currentPos = {
		top: 0,
		left: 0,
		width: 0,
		height: 0,
	};

	let details: HTMLDivElement;

	onMount(() => {
		if (typeof window === "undefined") return;

		json("/api/tags/data").then(x => (tags = x as Record<string, string>));

		(window as DetailedGameCardWindowWrapper).expandGame = (
			game,
			card,
			size
		) => {
			game.description = game.description.split("\n\n")[0];
			currentGame = game;
			currentCard = card;
			currentSize = size;

			const rect = currentCard.getBoundingClientRect();
			currentPos.top = rect.top + window.scrollY;
			currentPos.left = rect.left + window.scrollX;
			currentPos.width = rect.width + 0;
			currentPos.height = rect.height + 0;

			currentCard.style.opacity = "0";

			isInactive = false;

			setTimeout(() => {
				isTrans = true;
				isLeft =
					currentPos.left + currentPos.width / 2 >
					document.body.scrollWidth / 2;
				const value =
					(details.querySelector(".down").clientHeight + 6) / 0.6;
				currentPos.width += value;
				currentPos.left -=
					(value * (currentPos.left + currentPos.width / 2)) /
					document.body.scrollWidth;
				currentPos.left = Math.min(
					Math.max(currentPos.left, 10),
					document.body.scrollWidth - currentPos.width - 10
				);
				currentPos.top = Math.min(
					Math.max(currentPos.top, window.scrollY + 60),
					window.scrollY + window.innerHeight - currentPos.height - 10
				);
			}, 0);
			setTimeout(() => {
				isInfo = true;
				const value = 320;
				currentPos.width += value;
				if (isLeft) currentPos.left -= value;
				currentPos.left = Math.min(
					Math.max(currentPos.left, 10),
					document.body.scrollWidth - currentPos.width - 10
				);
			}, 200);

			currentAuthor = "...";
			currentFlair = "none";
			currentPic = undefined;

			let gameAuthor = authors.get(game.author);
			if (gameAuthor) {
				currentAuthor = gameAuthor.name;
				currentFlair = gameAuthor.equippedFlair;
				currentPic = gameAuthor.pfpTimestamp;
			} else {
				json("/api/users/info?id=" + game.author).then(x => {
					gameAuthor = { name: "?????", ...x.user };
					if (currentGame.author == game.author) {
						currentAuthor = gameAuthor.name;
						currentFlair = gameAuthor.equippedFlair;
						currentPic = gameAuthor.pfpTimestamp;
					}
					authors.set(game.author, gameAuthor);
				});
			}

			(window as DetailedGameCardWindowWrapper).isGameCardExpanded =
				isActive = true;
		};

		(window as DetailedGameCardWindowWrapper).shrinkGame = () => {
			isInactive = true;

			setTimeout(() => {
				isInfo = false;

				const rect = currentCard.getBoundingClientRect();
				currentPos.top = rect.top + window.scrollY - 2;
				currentPos.left = rect.left + window.scrollX;
				currentPos.width = rect.width + 0;
				currentPos.height = rect.height + 0;
			}, 0);
			setTimeout(() => {
				currentPos.top += 2;
			}, 200);
			setTimeout(() => {
				isTrans = isActive = false;
				currentCard.style.opacity = "";
			}, 400);

			(
				window as DetailedGameCardWindowWrapper
			).isGameCardExpanded = false;
		};

		details.addEventListener("pointerleave", () => {
			(window as DetailedGameCardWindowWrapper).shrinkGame();
		});
		window.addEventListener("scroll", () => {
			if (
				(window as DetailedGameCardWindowWrapper).isGameCardExpanded ===
					true &&
				!details.matches(":hover")
			) {
				(window as DetailedGameCardWindowWrapper).shrinkGame();
			}
		});
	});
</script>

<div
	id="game-details"
	class:small={currentSize?.thumb === "small"}
	class:active={isActive}
	class:inactive={isInactive}
	class:trans={isTrans}
	class:info={isInfo}
	class:left={isLeft}
	style={Object.entries(currentPos)
		.map(x => `${x[0]}: ${x[1]}px`)
		.join("; ")}
	bind:this={details}
	aria-hidden="true"
>
	{#if currentGame}
		<a id="game-detail-card" href={`/play/${currentGame.id}`}>
			<div
				class="thumb"
				style={`background: 
						url("${convertFormat(
							"/thumb/large/",
							currentGame.id,
							currentGame.thumbTimestamp
						)}") 
						no-repeat center center, 
						url("${convertFormat(
							"/thumb/medium/",
							currentGame.id,
							currentGame.thumbTimestamp
						)}") 
						no-repeat center center, #0003;`}
			/>
			<div class="down">
				<h3>{currentGame.name}</h3>
				<div class="rating">
					<span>
						<Icon icon="material-symbols:timer" width="16" />
						{formatPlaytime(currentGame.playMinutes)}
						<Icon icon="material-symbols:favorite" width="16" />
						{currentGame.favorites}
					</span>
					<span>
						{currentGame.ratingAvg == 0
							? "---"
							: currentGame.ratingAvg.toFixed(1)}
						<Icon icon="material-symbols:star" width="16" />
					</span>
				</div>
			</div>
		</a>
		<div id="game-detail-info">
			<h3>{currentGame.name}</h3>
			<div class="author">
				{currentGame.author === -1 ? "posted" : "developed"} by <UserChip
					small
					id={currentGame.author}
					name={currentAuthor}
					flair={currentFlair}
					pfpTimestamp={currentPic}
				/>
			</div>
			<div class="rating">
				<div>
					<h1>play-hours</h1>
					<Icon icon="material-symbols:timer" width="18" />
					{formatPlaytime(currentGame.playMinutes)}
				</div>
				<div>
					<h1>favorites</h1>
					<Icon icon="material-symbols:favorite" width="18" />
					{currentGame.favorites}
				</div>
				<div>
					<h1>
						{currentGame.ratingCount || "no"} rating{currentGame.ratingCount ==
						1
							? ""
							: "s"}
					</h1>
					<b
						>{currentGame.ratingAvg == 0
							? "---"
							: currentGame.ratingAvg.toFixed(1)}
						<Icon icon="material-symbols:star" width="18" /></b
					>
				</div>
			</div>
			{#each currentGame.tags as tag}
				<a
					class="button tag"
					class:custom={!tags[tag]}
					href="/search?tags={encodeURIComponent(tag)}"
					title={tags[tag]?.replace("{0}", "This game")}
				>
					{tag}
				</a>
			{/each}
			<hr />
			{currentGame.description}
			<!-- {md.parse(currentGame.description).filter(x => x.type == "inline").map(x => x.content).join(" ")} -->
		</div>
	{/if}
</div>

<style>
	#game-details {
		display: flex;
		flex-direction: row;
		position: absolute;
		background: var(--background-3);
		color: var(--color-2);
		box-shadow: 0 2px 10px white;
		border-radius: 5px;
		overflow: hidden;
	}

	#game-details:not(.active) {
		opacity: 0;
		pointer-events: none;
	}

	#game-details.trans {
		transition:
			top 0.2s,
			left 0.2s,
			width 0.2s,
			height 0.2s;
	}
	#game-details.left {
		flex-direction: row-reverse;
	}

	#game-details.inactive {
		background: var(--background-2);
		box-shadow: 0 0 5px black;
		transition:
			background 0.2s 0.2s,
			box-shadow 0.2s 0.2s,
			top 0.2s,
			left 0.2s,
			width 0.2s,
			height 0.2s;
	}

	#game-detail-card {
		flex: 1 1;
		display: block;
		text-decoration: none;
	}

	#game-detail-info {
		display: block;
		text-decoration: none;
	}

	.thumb {
		display: inline-block;
		width: 100%;
		position: relative;

		aspect-ratio: 5 / 3;

		background-size: 115% !important;
		transition: background-size 0.2s;
	}

	.active .thumb {
		background-size: 101% !important;
	}

	h3 {
		font-family: var(--content-font);
		font-weight: normal;
		margin: 0;
		display: inline;
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
		font-size: 12px;
	}

	.rating :global(svg) {
		vertical-align: -3px;
	}

	#game-detail-info .rating :global(svg) {
		vertical-align: -3.5px;
	}

	.rating > :last-child {
		text-align: right;
		float: right;
	}

	#game-detail-info {
		width: 304px;
		padding: 6px 8px;
		margin-right: -320px;
		-webkit-mask-image: linear-gradient(180deg, #000 85%, transparent);
		mask-image: linear-gradient(180deg, #000 85%, transparent);
	}

	.left #game-detail-info {
		margin-left: -320px;
		margin-right: 0px;
	}

	.info #game-detail-info {
		transition: margin 0.2s;
		margin: 0;
	}

	.inactive #game-detail-info {
		transition: margin 0.2s;
	}

	#game-detail-info h3 {
		font-family: var(--header-font);
		font-size: 18px;
	}

	#game-detail-info .author {
		font-size: 12px;
	}

	#game-detail-info .rating {
		font-size: 14px;
		display: flex;
		flex-direction: row;
		margin: 3px 0;
	}
	#game-detail-info .rating > * {
		padding-right: 10px;
	}
	#game-detail-info .rating > :last-child {
		flex: 1 1;
		padding-right: 0;
	}
	#game-detail-info .rating h1 {
		font-size: 12px;
		font-weight: normal;
		margin-block: 0;
		color: var(--color-4);
	}
	#game-detail-info .button {
		height: 20px;
		font-size: 12px;
		line-height: 20px;
		background: var(--background-4);
		padding: 0 6px;
		text-decoration: none;
	}
	#game-detail-info .button:hover {
		background: var(--background-active-4);
		text-decoration: 1px underline;
	}
	#game-detail-info .button.tag.custom {
		background: var(--tag-border-bg), var(--background-4);
	}
	#game-detail-info .button.tag.custom:hover {
		background: var(--tag-border-bg), var(--background-active-4);
	}
	/* #game-detail-info .description {    
        display: block;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: calc(100%);
        margin: 0;
    } */
</style>
