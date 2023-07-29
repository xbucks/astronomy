<script lang="ts">
	import { alert, post } from "../../libgalaxy";
	import MarkdownEditor from "../MarkdownEditor.svelte";
	import { updateChangelog } from "../../helper/markdown";

	export let id: number;

	let name: string;
	let version: string;
	let changelog: string;

	async function publishUpdate() {
		const out = await post("/api/updates/new", {
			game: id,
			changelog: changelog,
			version: version,
			name: name,
		});

		if (out._resCode === 201) {
			alert.success(out.message);
			name = "";
			version = "";
			changelog = "";
		}
	}
</script>

<h2>updates</h2>
<div>
	Did you just push an update to your game? Tell us about it! Updating your
	game bumps it in the "recently updated" sort. Update logs can be viewed by
	everyone.<br /><br />
	<b>Abuse of updates to keep your game at #1 can result in a ban.</b>
	<br /><br />
	name <span class="unimportant">(optional)</span><br />
	<input type="text" bind:value={name} />
	<br />

	version number <span class="unimportant">(optional)</span><br />
	<input type="text" bind:value={version} />
	<br />

	changelog<br />
	<MarkdownEditor
		bind:value={changelog}
		placeholder="(markdown supported)"
		options={updateChangelog}
		maxlength={8192}
	/><br />
	<br />
	<button on:click={publishUpdate}>update and bump</button>
</div>

<style>
</style>
