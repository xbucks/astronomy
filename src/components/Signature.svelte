<a class="galaxy-signature" href="/" aria-label="Galaxy Beta">
	galaxy<span class="beta-tag">BETA</span>
</a>

<style>
	.galaxy-signature {
		color: var(--color-0);
		font-size: 14px;

		text-decoration: none;
		font-weight: bold;
		font-family: var(--header-font);
		transition: text-shadow 0.5s;
	}
	.beta-tag {
		display: inline-block;

		height: 16px;
		margin: 0 5px;
		padding: 1px 3px 0 3px;

		background: var(--color-0);
		color: var(--background-2);

		font-weight: bold;
		font-family: var(--content-font);
		line-height: 16px;
		font-size: 12px;
		transition:
			color 0.5s,
			box-shadow 0.5s;
	}
	.galaxy-signature:hover,
	.galaxy-signature:focus-visible {
		color: var(--background-2);
		text-shadow:
			0 0 5px var(--color-0),
			0 0 5px var(--color-0),
			0 0 5px var(--color-0),
			0 0 5px var(--color-0),
			0 0 5px var(--color-0);
		outline: none;
		transition: color 0.5s;
	}
	.galaxy-signature:hover .beta-tag,
	.galaxy-signature:focus-visible .beta-tag {
		background: var(--background-2);
		color: var(--color-0);
		text-shadow: none;
		box-shadow:
			0 0 5px var(--color-0),
			0 0 5px var(--color-0);
		transition: background 0.5s;
	}
</style>
