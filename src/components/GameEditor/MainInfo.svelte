<script lang="ts">
	import { alert, post } from "../../libgalaxy";
	import MarkdownEditor from "../MarkdownEditor.svelte";
	import { gameDescription } from "../../helper/markdown";

	export let id: number;
	export let name: string;
	export let description: string;
	export let link: string;

	const lastName = name;
	const lastLink = link;

	async function updateMain() {
		const out = await post("/api/games/edit", {
			id: id,
			new: {
				name,
				description,
				link,
			},
		});

		if (out._resCode === 201) {
			alert.success(out.message);
		}

		if (name == "" && link == "") {
			window.location.href = "/manage";
		} else if (link != lastLink) {
			window.location.reload();
		}
	}
</script>

<h2>main info</h2>
<div>
	name<br />
	<input type="text" bind:value={name} /><br />
	link<br />
	<input type="url" bind:value={link} /><br />
	description<br />
	<MarkdownEditor
		bind:value={description}
		options={gameDescription}
		maxlength={8192}
	/>
	<br />

	{#if name == "" && link == ""}
		<b class="danger">Warning: You're about to delete your game.</b>
		<br />
		This is not a reversible action &mdash; once you delete the game, it's gone
		forever!
		<br />
		<button on:click={() => ((name = lastName), (link = lastLink))}
			>revert change</button
		>
		<br /><br />
		<button class="danger" on:click={updateMain}>delete game</button>
	{:else}
		{#if link != lastLink}
			<b>Warning: You're about to modify your game's link.</b>
			<br />
			If you continue, your game will be delisted and the new link will need
			to be verified by our staff in order for the game to become visible again.
			Please only do so if your game is about to move to a new location.
			<br />
			<button on:click={() => (link = lastLink)}>revert change</button>
			<br /><br />
		{/if}
		<button on:click={updateMain}>save</button>
	{/if}
</div>

<style>
	.danger {
		color: var(--flair-owner-fg);
	}
</style>
