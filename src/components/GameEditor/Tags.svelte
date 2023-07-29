<script lang="ts">
	import { alert, json, post } from "../../libgalaxy";
	import { onMount } from "svelte";

	export let id: number;
	export let tags: string[];

	let loading = true;

	let allTags: Record<string, string>;
	let inactiveTags: string[];

	async function updateTags() {
		const res = await post("/api/games/tags", {
			id,
			tags,
		});

		if (res._resCode === 200) alert.success(res.message);
	}

	async function loadTheStuff() {
		allTags = await json("/api/tags/data");
		inactiveTags = Object.keys(allTags).filter(tag => !tags.includes(tag));

		loading = false;
	}

	function removeTag(tag: string) {
		return () => {
			tags = tags.filter(t => t !== tag);
			if (allTags[tag]) inactiveTags.push(tag);

			// Another svelte compiler hack
			inactiveTags = inactiveTags;
		};
	}

	function applyTag(tag: string) {
		return () => {
			if (tags.length >= 30) return false;

			inactiveTags = inactiveTags.filter(t => t !== tag);
			tags.push(tag);

			// Svelte compiler hack
			tags = tags;
		};
	}

	let customTag = "";
	function applyCustomTag() {
		if (customTag.length < 2) return false;
		if (tags.length >= 30) return false;

		tags.push(customTag);
		customTag = "";
		tags = tags;
	}

	onMount(loadTheStuff);
</script>

{#if loading}
	<p>
		I'm loading a list of tags.
		<span class="unimportant">Everybody loves me.</span>
	</p>
{:else}
	<h2>tags</h2>
	<div>
		Help potential players find your games by giving them tags relevant to
		the game. It is recommended you get most of your tags from the
		pre-defined list below, but if they do not fit your needs you can add
		custom tags.
		<h4>active tags</h4>
		<div class="compact">
			{#each tags as tag}
				<button
					class="tag"
					class:custom={!allTags[tag]}
					on:click={removeTag(tag)}
					title={allTags[tag]?.replace("{0}", "Your game")}
					>{tag}</button
				>
			{/each}
		</div>

		<h4>inactive tags</h4>
		{#each inactiveTags as tag}
			<button
				class="tag"
				on:click={applyTag(tag)}
				title={allTags[tag]?.replace("{0}", "Your game")}>{tag}</button
			>
		{/each}

		<br />

		<input
			type="text"
			bind:value={customTag}
			maxlength="64"
			placeholder="enter a custom tag..."
		/>
		<button on:click={applyCustomTag}>add custom tag</button>

		<br />
		<br />

		<button on:click={updateTags}>save</button>
	</div>
{/if}
