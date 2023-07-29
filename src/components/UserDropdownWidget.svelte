<script lang="ts">
	import Dropdown from "./Dropdown.svelte";
	import type { IUser } from "../types";
	import { report } from "../libgalaxy";

	export let user: IUser, current: IUser | null;

	function copyLink() {
		window.navigator.clipboard.writeText(
			`${window.location.origin}/user/${user.id}`
		);
	}

	function reportUser() {
		report("user", user);
	}
</script>

<span class="compact">
	<Dropdown openLeft>
		<button on:click={copyLink}>copy user link</button>
		{#if current && current.id !== user.id && user.id !== -1}
			<button on:click={reportUser}>report user</button>
		{/if}
	</Dropdown>
</span>
