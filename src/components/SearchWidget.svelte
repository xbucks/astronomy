<script lang="ts">
	import type { SearchType, SortOrder } from "../helper/searchShared";
	import {
		defaultSearchType,
		defaultSortOrder,
		queryFromSearchParams,
		queryToSearchParams,
		searchTypes,
	} from "../helper/searchShared";

	export let tagList: Record<string, string>;
	export let tagCategories: Record<string, string[]>;

	const searchParams = new URLSearchParams(window.location.search);
	const queryRaw = queryFromSearchParams(searchParams);
	const query = {
		q: queryRaw.q ?? "",
		type: queryRaw.type ?? defaultSearchType,
		sort: queryRaw.sort ?? defaultSortOrder,
		tags: queryRaw.tags ?? [],
		global: queryRaw.global ?? false,
	};

	let tabMode = "";
	let customTag = "";

	function setTab(target: string) {
		tabMode = tabMode == target ? "" : target;
	}

	// let unusedTags = Object.keys(tagList).filter(t => !query.tags.includes(t));

	// function updateUnusedTags() {
	// 	unusedTags = Object.keys(tagList).filter(t => !query.tags.includes(t));
	// }

	function addTag(tag: string) {
		if (query.tags.length >= 5) return;
		query.tags.push(tag);
		query.tags = query.tags;
		// updateUnusedTags();
	}

	function removeTag(tag: string) {
		query.tags = query.tags.filter(t => t !== tag);
		// updateUnusedTags();
	}

	function toggleTag(tag: string) {
		if (query.tags.includes(tag)) removeTag(tag);
		else addTag(tag);
	}

	const typeToName: { [key in SearchType]: string } = {
		rating: "rating",
		favorite: "favorite count",
		playtime: "playtime",
		updated: "update time",
		creation: "creation age",
		alphabet: "alphabetical",
	};

	const sortNames: [SortOrder, string][] = [
		[1, "ascending ↑"],
		[-1, "descending ↓"],
	];

	function checkEnter(e: KeyboardEvent) {
		if (e.key === "Enter") window.location.href = searchURL;
	}

	$: searchURL = `/search?${queryToSearchParams(query)}`;
</script>

<div class="container">
	<div class="row">
		<input
			bind:value={query.q}
			on:keypress={checkEnter}
			type="search"
			placeholder="search games..."
		/>
		<a href={searchURL} class="button">search</a>
	</div>
	<div class="row">
		<button on:click={() => setTab("sort")}
			>sort by: {typeToName[query.type]}
			{query.sort == 1 ? "↑" : "↓"}</button
		>
		<button on:click={() => setTab("tags")}
			>tags: {query.tags.join(", ") || "[none]"}</button
		>
	</div>
	<div class="item-list compact">
		{#if tabMode == "sort"}
			<span>sort by:</span>
			{#each searchTypes as type}
				<button
					disabled={query.type == type}
					on:click={() => (query.type = type)}
				>
					{typeToName[type]}
				</button>
			{/each}
			<hr />
			<span>order:</span>
			{#each sortNames as [sort, name]}
				<button
					disabled={query.sort == sort}
					on:click={() => (query.sort = sort)}
				>
					{name}
				</button>
			{/each}
		{/if}
		{#if tabMode == "tags"}
			<span>include tags:</span>
			{#each query.tags as tag}
				<button
					class="tag"
					class:custom={!tagList[tag]}
					on:click={() => removeTag(tag)}
					title={tagList[tag]?.replace("{0}", "Your desired game")}
				>
					{tag}
				</button>
			{/each}
			<hr />
			<span>official tags:</span>
			<div class="item-list compact">
				{#each Object.keys(tagCategories) as cat}
					<span>{cat}:</span>
					{#each tagCategories[cat] as tag}
						<button
							class="tag"
							class:active={query.tags.includes(tag)}
							on:click={() => toggleTag(tag)}
							title={tagList[tag]?.replace(
								"{0}",
								"Your desired game"
							)}
						>
							{tag}
						</button>
					{/each}
					<br />
				{/each}
			</div>
			<br />
			<span>custom tags:</span>
			<input
				type="text"
				placeholder="(tag here)"
				bind:value={customTag}
			/>
			<button on:click={() => toggleTag(customTag)}>add tag</button>
			<br />
			<span><a href="/filters" target="_blank">global filters</a>:</span>
			<input type="checkbox" bind:checked={query.global} />
		{/if}
	</div>
</div>

<style>
	.item-list {
		margin-left: 108px;
	}
	.item-list > * {
		font-size: 12px;
	}
	.item-list > span:not(.tag-slot) {
		display: inline-block;
		text-align: right;
		width: 100px;
		margin-left: -111.5px;
		margin-right: 8px;
		padding-block: 7px;
	}
	.item-list > hr {
		border: none;
		margin: 2px;
	}
	.item-list .item-list {
		display: inline-block;
		vertical-align: top;
		margin-top: 0;
	}

	@media (max-width: 720px) {
		.item-list {
			margin-left: 12px;
		}
		.item-list > span:not(.tag-slot) {
			display: block;
			text-align: left;
			width: auto;
			margin-left: -12px;
		}
	}

	button:not(.tag):disabled,
	button:not(.tag):disabled:hover {
		color: var(--color-active-0);
		background: var(--background-active-0);
		text-decoration: none;
		box-shadow: inset 1px 0 5px #0007;
		cursor: default;
	}

	button.tag.active {
		background: var(--background-green-1);
	}

	.container {
		padding: 20px;
	}

	.row {
		display: flex;
		flex-direction: row;
		gap: 2px;
	}

	.row + .row {
		margin-top: 2px;
	}

	.row input {
		flex-grow: 1;
	}
	.row button,
	.row a.button {
		margin: 0;
	}

	.item-list {
		margin-top: 5px;
	}
</style>
