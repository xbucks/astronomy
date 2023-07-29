<script lang="ts">
	import type { IUser } from "../types";
	import UserChip from "./UserChip.svelte";
	import { json } from "../libgalaxy";

	export let showTabs = false;
	export let tab = "name";

	let name = "";
	let id = "";
	export let found = false;
	export let data: IUser = {} as IUser;
	export async function testUser() {
		const res = await json(
			tab === "name"
				? `/api/users/byName?name=${name}`
				: `/api/users/info?id=${id || 0}`
		);
		if (res.message === "no") {
			found = false;
		} else if (res.message === "yes") {
			found = true;
			data = tab === "name" ? res : res.user;
		}
	}
</script>

{#if showTabs}
	<div class="two-grid">
		<button on:click={() => (tab = "name")}>username</button>
		<button on:click={() => (tab = "id")}>user ID</button>
	</div>
{/if}
{#if tab === "name"}
	<input
		bind:value={name}
		on:input={testUser}
		class="tiny-margin-top"
		type="text"
		placeholder="enter username"
	/>
{:else if tab === "id"}
	<input
		bind:value={id}
		on:input={testUser}
		class="tiny-margin-top"
		type="text"
		placeholder="enter user ID"
	/>
{/if}

{#if found}
	<UserChip small user={data} />
{:else}
	<p class="unimportant">(user not found)</p>
{/if}

<style>
	.two-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
	}

	.tiny-margin-top {
		margin-top: 3px;
	}
</style>
