<script lang="ts">
	import type { IUser } from "../types";
	import { convertFormat } from "../libgalaxy";

	export let user: IUser | null = null;
	export let id: number | null = null;
	export let name: string | null = null;
	export let flair: string | null = null;
	export let pfpTimestamp: number | null = null;

	export let small = false;

	$: if (user) {
		id = user.id;
		name = user.name;
		flair = user.equippedFlair;
		pfpTimestamp = user.pfpTimestamp;
	}
</script>

<a
	href="/user/{id}"
	class="button user-chip"
	class:no-flair={flair === "none"}
	class:small
	aria-label="User {name} with flair {flair}"
>
	<img
		class="profile-pic inline"
		src={convertFormat("/pfp/medium/", id, pfpTimestamp)}
		alt=""
	/><span class="username">{name}</span>{#if flair !== "none"}
		<span class="flair" data-flair={flair}>
			{flair}
		</span>
	{/if}
</a>

<style>
	.user-chip {
		display: inline-flex;
		padding-right: 0;
		text-decoration: none;
		vertical-align: -8px;
	}
	.user-chip:hover {
		text-decoration: none;
	}
	.user-chip:hover .username {
		text-decoration: underline 1px;
	}

	.username {
		margin-right: 12px;
	}

	.flair {
		display: inline-block;
		height: 100%;
		padding: 0 12px;
		margin: 0 0 0 0px;
		border-radius: 0 3px 3px 0;
	}

	.small {
		font-size: 12px;
		height: 20px;
		line-height: 20px;
		padding-left: 6px;
		vertical-align: -6px;
	}
	.small .username {
		margin-right: 6px;
	}
	.small > img.inline {
		vertical-align: -6px;
		margin: 0 6px 0 -6px;
		height: 20px;
		width: 20px;
	}
	.small > .flair {
		padding: 0 6px;
	}
</style>
