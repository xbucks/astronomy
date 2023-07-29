<script lang="ts">
	import Icon from "@iconify/svelte";

	export let openLeft = false;

	let open = false;
	let self: HTMLDivElement;

	function dropClickHandler(e: PointerEvent) {
		if (!self.contains(e.target as Node)) setOpen(false);
	}

	function setOpen(to: boolean) {
		open = to;
		if (open)
			document.body.addEventListener("pointerdown", dropClickHandler);
		else document.body.removeEventListener("pointerdown", dropClickHandler);
	}
</script>

<div class="dropdown" class:open bind:this={self}>
	<button
		class="icon-button"
		on:click={() => setOpen(!open)}
		aria-label="Toggle dropdown"
	>
		<Icon icon="material-symbols:more-vert" width="16" inline />
	</button>
	<div
		class="dropdown-content"
		style="{openLeft ? 'right' : 'left'}: -3px"
		on:click={() => setOpen(false)}
		on:keydown={e => {
			if (e.key == "Enter") setOpen(false);
		}}
		on:keyup={e => {
			if (e.key == " ") setOpen(false);
		}}
	>
		<slot />
	</div>
</div>

<style>
	.dropdown {
		position: relative;
		display: inline-block;
	}

	.dropdown-content {
		display: none;
		position: absolute;
		top: 0;
		width: max-content;
		padding: 3px;
		pointer-events: none;
		background: var(--background-3);
		border-radius: 3px;
		box-shadow: 1px 0 8px #0007;
		z-index: 5;
	}

	.dropdown.open > button {
		border-radius: 3px 3px 0 0;
	}

	.dropdown.open .dropdown-content {
		display: block;
		pointer-events: all;
		top: 100%;
	}

	.dropdown-content > :global(:is(button, a)) {
		margin: 0;
		padding: 0 12px;
		display: block;
		height: 26px;
		line-height: 26px;
		width: 100%;
		color: var(--color-0);
		text-decoration: none;
		border-radius: 3px;
		text-align: left;
		box-shadow: none;
	}
	.dropdown-content > :global(a) {
		width: calc(100% - 24px);
	}
	.dropdown-content > :global(:is(button, a):before) {
		content: ">\00a0";
		opacity: 0.5;
		display: inline-block;
	}
	.dropdown-content > :global(:is(button, a):hover),
	.dropdown-content > :global(:is(button, a):focus) {
		color: var(--color-active-0);
		background: var(--background-active-5);
		text-decoration: 1.25px solid underline;
		outline: none;
		transition:
			background 0.3s,
			color 0.3s;
	}

	/* .dropdown:active .dropdown-content,
	.dropdown:focus-within .dropdown-content {
		display: block;
		top: 16px;
		opacity: 1;
	} */
</style>
