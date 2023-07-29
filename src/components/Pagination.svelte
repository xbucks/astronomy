<script lang="ts">
	export let url: URL;
	export let pages: number;
	export let currentPage: number;

	// TODO: Wow! this code sucks
	function urlg(page: number) {
		const tmpUrl = url;
		tmpUrl.searchParams.set("page", page.toString());
		return tmpUrl.href;
	}
</script>

<div class="flex-centerhoriz">
	{#if pages <= 5 && pages !== 1}
		{#each new Array(pages) as _, page}
			<a
				href={urlg(page + 1)}
				class="paginate button"
				class:current={page + 1 === currentPage}
			>
				{page + 1}
			</a>
		{/each}
	{:else if pages > 5}
		{#if currentPage > 3}
			<a href={urlg(currentPage - 1)} class="paginate button">&lt;</a>
		{/if}
		{#if currentPage > 1}
			<a href={urlg(1)} class="paginate button">1</a>
		{/if}
		{#if currentPage === 3}
			<a href={urlg(2)} class="paginate button">2</a>
		{/if}
		<a href={urlg(currentPage)} class="paginate button current"
			>{currentPage}</a
		>
		{#if pages === currentPage + 2}
			<a href={urlg(currentPage + 1)} class="paginate button"
				>{pages - 1}</a
			>
		{/if}
		{#if pages > currentPage}
			<a href={urlg(pages)} class="paginate button">{pages}</a>
		{/if}
		{#if pages > currentPage + 2}
			<a href={urlg(currentPage + 1)} class="paginate button">&gt;</a>
		{/if}
	{/if}
</div>

<style>
	.paginate {
		height: 40px;
		width: 40px;
		font-size: 16px;
		margin: 8px;
		text-decoration: none !important;
		text-align: center;
		padding: 0;
		line-height: 40px;
		border-radius: 100px;
	}

	.paginate.current,
	.paginate.current:hover {
		color: var(--color-active-0);
		background: var(--background-active-0);
		text-decoration: none;
		box-shadow: inset 1px 0 5px #0007;
		cursor: default;
	}
</style>
