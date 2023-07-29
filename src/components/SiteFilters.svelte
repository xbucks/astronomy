<script lang="ts">
	export let negTags: string[] = [];
	export let posTags: string[] = [];
	export let categories: { [key: string]: string[] };
	export let tagData: { [key: string]: string };

	function toggleTag(tag: string) {
		if (negTags.includes(tag)) {
			negTags = negTags.filter(t => t !== tag);
			posTags.push(tag);
		} else if (posTags.includes(tag)) {
			posTags = posTags.filter(t => t !== tag);
		} else {
			negTags.push(tag);
		}
		negTags = negTags;
		posTags = posTags;
	}

	function removeTag(tag: string) {
		negTags = negTags.filter(t => t !== tag);
		posTags = posTags.filter(t => t !== tag);
		negTags = negTags;
		posTags = posTags;
	}

	function updateFilters() {
		document.cookie = `filters=${negTags.join(",")}|${posTags.join(
			","
		)}; Path=/; Max-Age=2147483647`;
		location.reload();
	}
</script>

<div data-label="excluded tags:" class="item-list compact">
	<div>
		{#each negTags as tag}
			<button class="tag small" on:click={() => removeTag(tag)}
				>{tag}</button
			>
		{:else}
			<span class="tag-slot">no tags</span>
		{/each}
	</div>
</div>

<div data-label="required tags:" class="item-list compact">
	<div>
		{#each posTags as tag}
			<button class="tag small" on:click={() => removeTag(tag)}
				>{tag}</button
			>
		{:else}
			<span class="tag-slot">no tags</span>
		{/each}
	</div>
</div>

<div data-label="official tags:" class="item-list compact">
	<div class="item-list">
		{#each Object.keys(categories) as cat}
			<span>{cat}:</span>
			{#each categories[cat] as tag}
				<button
					class="tag"
					class:active={posTags.includes(tag)}
					class:nactive={negTags.includes(tag)}
					on:click={() => toggleTag(tag)}
					title={tagData[tag]?.replace("{0}", "Your desired game")}
				>
					{tag}
				</button>
			{/each}
			<br />
		{/each}
	</div>
</div>
<br />
<div>
	<button id="save" on:click={updateFilters}>save filters</button>
</div>
<div>
	<p class="unimportant">
		Note: By confirming and saving the settings you accept the use of
		cookies to store your preferences.
	</p>
</div>

<style>
	.compact {
		font-size: 12px;
	}

	.compact > div {
		min-height: 30px;
	}

	div[data-label]::before {
		padding-top: 7.5px;
	}

	.item-list {
		margin-left: 108px;
	}
	.item-list.compact {
		margin-left: 0px;
	}
	.item-list > *,
	.item-list .tag-slot {
		font-size: 12px;
	}
	.item-list > span:not(.unimportant) {
		display: inline-block;
		text-align: right;
		width: 100px;
		margin-left: -111.5px;
		margin-right: 8px;
		padding-block: 7px;
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
		.item-list > .item-list {
			margin-left: 24px;
		}
		.item-list > span:not(.unimportant) {
			display: block;
			text-align: left;
			width: auto;
			margin-left: -12px;
		}
	}

	button.tag.active {
		background: var(--background-green-1);
	}

	button.tag.nactive {
		background: var(--background-red-1);
	}
</style>
