<script lang="ts">
	import DateTime from "./DateTime.svelte";
	import type { IUpdate } from "../types";
	import { updateChangelog as md } from "../helper/markdown";

	export let update: IUpdate;
	export let title = true;
</script>

{#if title}
	<h3>
		{#if update.name || update.version}
			{update.name ?? ""}
			{#if update.version}
				<span class:unimportant={!!update.name}>{update.version}</span>
			{/if}
			<DateTime
				style="date"
				date={new Date(update.createdAt)}
				before="•"
				unimportant
			/>
		{:else}
			<DateTime style="date" date={new Date(update.createdAt)} />
		{/if}
	</h3>
{/if}
{@html md.render(update.changelog)}
