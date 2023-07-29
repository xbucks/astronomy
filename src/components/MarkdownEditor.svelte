<script lang="ts">
	// TODO: Fix undo/redp

	import Icon from "@iconify/svelte";
	import MarkdownIt from "markdown-it";
	//import { RuleBlock } from "markdown-it/lib/parser_block";
	//import { foregroundColorNames } from "chalk";
	//import { xlink_attr } from "svelte/internal";

	export let value = "";
	export let name = "";
	export let placeholder = "";
	export let form = "";
	export let maxlength = 0;
	export let background = "var(--background-1)";

	export let options = MarkdownIt();

	let toolbar: HTMLDivElement;
	let input: HTMLTextAreaElement;
	let popup: HTMLDivElement;

	function onInput() {
		input.style.height = 0 + "px";
		input.style.height = input.scrollHeight + "px";
	}

	function onInputUpdate() {
		if (inAction) {
			inAction = false;
			document.body.removeEventListener("pointerdown", popupClickHandler);
		}
	}

	function hasBlockRule(rule: string) {
		return (options.block.ruler as any).__rules__.find(x => x.name == rule)
			?.enabled as boolean;
	}
	function hasInlineRule(rule: string) {
		return (options.inline.ruler as any).__rules__.find(x => x.name == rule)
			?.enabled as boolean;
	}

	function wrapTag(start: string, end: string | null = null) {
		if (end == null) end = start;

		const startPos = input.selectionStart;
		const endPos = input.selectionEnd;

		value = input.value =
			value.substring(0, startPos) +
			start +
			value.substring(startPos, endPos) +
			end +
			value.substring(endPos);

		input.focus();
		input.setSelectionRange(startPos + start.length, endPos + start.length);
		onInput();
	}

	function addBlock(start: string, end: string = "") {
		const startPos = input.selectionStart;
		const endPos = input.selectionEnd;

		if (![undefined, "\r", "\n"].includes(value[startPos - 1]))
			start = "\n" + start;
		if (![undefined, "\r", "\n"].includes(value[endPos])) end += "\n";

		value = input.value =
			value.substring(0, startPos) +
			start +
			value.substring(startPos, endPos) +
			end +
			value.substring(endPos);
		input.focus();
		input.setSelectionRange(startPos + start.length, endPos + start.length);
		onInput();
	}

	let inAction = false;
	let currentAction = "";
	let actionText = "";
	let linkText = "",
		linkUrl = "",
		linkStart = 0,
		linkEnd = 0;

	const popupStyle = {} as Record<string, string>;

	function doAction(action: string, arg: any = "", isNew = true) {
		currentAction = action;

		let startPos = input.selectionStart;
		let endPos = input.selectionEnd;

		if (isNew) {
			actionText = value.substring(startPos, endPos);
		} else if (action == "link") {
			startPos = linkStart;
			endPos = linkEnd;
		}

		const result = actions[action](arg);
		value = input.value =
			value.substring(0, startPos) + result + value.substring(endPos);

		input.setSelectionRange(startPos, startPos + result.length);
		onInput();

		if (action == "link") {
			linkStart = startPos;
			linkEnd = startPos + result.length;
		} else {
			input.focus();
		}

		inAction = true;
		document.body.addEventListener("pointerdown", popupClickHandler);
	}

	function popupClickHandler(e: PointerEvent) {
		if (!popup?.contains(e.target as Node)) {
			inAction = false;
			document.body.removeEventListener("pointerdown", popupClickHandler);
		}
	}

	const actions = {
		heading(level: number) {
			const startPos = input.selectionStart;
			const endPos = input.selectionEnd;

			let list = actionText.split(/(\r\n?|\n)/).filter(x => x !== "\n");

			if (!list.length) list = [" "];

			let result = list
				.map(
					x => (
						console.log(x),
						x.trim() || list.length == 1
							? "#".repeat(level) + " " + x.trimStart()
							: ""
					)
				)
				.join("\n");

			if (![undefined, "\r", "\n"].includes(value[startPos - 1]))
				result = "\n" + result;
			if (![undefined, "\r", "\n"].includes(value[endPos]))
				result += "\n";

			return result;
		},
		blockquote() {
			const startPos = input.selectionStart;
			const endPos = input.selectionEnd;

			let list = actionText.split(/(\r\n?|\n)/).filter(x => x !== "\n");

			if (!list.length) list = [" "];

			let result = list
				.map(
					x => (
						console.log(x),
						x.trim() || list.length == 1 ? "> " + x.trimStart() : ""
					)
				)
				.join("\n");

			if (![undefined, "\r", "\n"].includes(value[startPos - 1]))
				result = "\n" + result;
			if (![undefined, "\r", "\n"].includes(value[endPos]))
				result += "\n";

			return result;
		},
		list(type: string) {
			const startPos = input.selectionStart;
			const endPos = input.selectionEnd;

			let index = 0;
			const types = {
				"-": x => "- " + x,
				number: x => (index++, index + ". " + x),
			};

			let list = actionText.split(/(\r\n?|\n)/).filter(x => x !== "\n");

			if (!list.length) list = [" "];

			let result = list
				.map(
					x => (
						console.log(x),
						x.trim() || list.length == 1 ? types[type](x) : ""
					)
				)
				.join("\n");

			if (![undefined, "\r", "\n"].includes(value[startPos - 1]))
				result = "\n" + result;
			if (![undefined, "\r", "\n"].includes(value[endPos]))
				result += "\n";

			return result;
		},
		link(start: boolean) {
			if (start) {
				linkText = actionText;
				linkUrl = "";
			}

			const result = `[${linkText
				.replaceAll("[", "\\[")
				.replaceAll("]", "\\]")}](${linkUrl
				.replaceAll("[", "\\[")
				.replaceAll("]", "\\]")})`;

			return result;
		},
	};
</script>

<div class="markdown-editor">
	<div class="markdown-toolbar compact" bind:this={toolbar}>
		{#if hasInlineRule("emphasis")}
			<button
				class="toolbar-button icon-button"
				title="bold"
				on:click={() => wrapTag("**")}
			>
				<Icon icon="material-symbols:format-bold" width="21" />
			</button>
			<button
				class="toolbar-button icon-button"
				title="italic"
				on:click={() => wrapTag("*")}
			>
				<Icon icon="material-symbols:format-italic" width="21" />
			</button>
		{/if}
		{#if hasInlineRule("strikethrough")}
			<button
				class="toolbar-button icon-button"
				title="strikethrough"
				on:click={() => wrapTag("~~")}
			>
				<Icon icon="material-symbols:strikethrough-s" width="21" />
			</button>
		{/if}
		<hr />
		{#if hasBlockRule("heading")}
			<button
				class="toolbar-button icon-button"
				title="heading"
				on:click={() => doAction("heading", 1)}
			>
				<Icon icon="material-symbols:tag" width="21" />
			</button>
		{/if}
		{#if hasBlockRule("blockquote")}
			<button
				class="toolbar-button icon-button"
				title="quote block"
				on:click={() => doAction("blockquote", 1)}
			>
				<Icon icon="material-symbols:format-quote" width="21" />
			</button>
		{/if}
		{#if hasBlockRule("fence")}
			<button
				class="toolbar-button icon-button"
				title="code block"
				on:click={() => addBlock("```\n", "\n```")}
			>
				<Icon icon="material-symbols:frame-source" width="21" />
			</button>
		{/if}
		{#if hasBlockRule("list")}
			<button
				class="toolbar-button icon-button"
				title="list"
				on:click={() => doAction("list", "-")}
			>
				<Icon icon="material-symbols:list" width="21" />
			</button>
		{/if}
		<hr />
		{#if hasInlineRule("backticks")}
			<button
				class="toolbar-button icon-button"
				title="inline code"
				on:click={() => wrapTag("`")}
			>
				<Icon icon="material-symbols:code" width="21" />
			</button>
		{/if}
		{#if hasInlineRule("link")}
			<button
				class="toolbar-button icon-button"
				title="link"
				on:click={() => doAction("link", true)}
			>
				<Icon icon="material-symbols:link" width="21" />
			</button>
		{/if}

		{#if maxlength}
			<div class="limit">
				{(maxlength - value.length).toLocaleString("en-US")}
			</div>
		{/if}

		{#if inAction}
			<div
				class="markdown-action"
				bind:this={popup}
				style={Object.entries(popupStyle)
					.map(([x, y]) => x + ":" + y)
					.join(";")}
			>
				{#if currentAction == "heading"}
					{#each [1, 2, 3, 4, 5, 6] as level}
						<button
							on:click={() => doAction("heading", level, false)}
						>
							heading {level}
						</button>
					{/each}
				{:else if currentAction == "list"}
					<button on:click={() => doAction("list", "-", false)}>
						unordered list
					</button>
					<button on:click={() => doAction("list", "number", false)}>
						ordered list
					</button>
				{:else if currentAction == "link"}
					<input
						placeholder="label"
						bind:value={linkText}
						on:input={() => doAction("link", false, false)}
					/>
					<input
						placeholder="url"
						bind:value={linkUrl}
						on:input={() => doAction("link", false, false)}
					/>
				{/if}
			</div>
		{/if}
	</div>
	<textarea
		{name}
		{placeholder}
		{form}
		{maxlength}
		style="background: {background}"
		bind:this={input}
		bind:value
		on:input={onInput}
		on:keydown={onInputUpdate}
	/>
</div>

<style>
	.markdown-editor {
		position: relative;
	}

	.markdown-toolbar {
		position: sticky;
		display: flex;
		flex-direction: row;
		top: 56px;
		margin: -36px -1px 4px -1px;
		width: calc(100% - 4px);
		background: var(--background-3);
		box-shadow: 0 1px 5px #0007;
		z-index: 1;
		border-radius: 3px;
		padding: 3px;
		opacity: 0;
		transform: translateY(-4px);
		transition:
			opacity 0.2s,
			transform 0.2s;
	}
	.markdown-editor:focus-within .markdown-toolbar {
		opacity: 1;
		transform: none;
	}
	.markdown-toolbar button {
		margin: 0;
		border-radius: 3px;
	}
	.markdown-toolbar button :global(svg) {
		vertical-align: -4px;
	}
	.markdown-toolbar hr {
		display: inline-block;
		border: none;
		background: var(--color-4);
		width: 1px;
		margin: 0 4px;
		flex-grow: 0;
	}
	.markdown-toolbar :is(hr:first-child, hr:last-child, hr + hr) {
		display: none;
	}
	.markdown-toolbar .limit {
		margin: 4px 6px auto auto;
		color: var(--color-4);
	}

	textarea {
		width: 100%;
		min-height: 80px;
		box-sizing: border-box;
		outline: 1px solid #7770;
		padding: 6px 12px;
	}
	.markdown-editor:focus-within textarea {
		outline: 1px solid var(--color-active-4);
		transition: outline 0.3s;
	}

	.markdown-action {
		position: absolute;
		top: calc(100% + 4px);
		right: 0;
		width: max-content;
		padding: 3px;
		background: var(--background-3);
		border-radius: 3px;
		box-shadow: 1px 0 8px #0007;
		z-index: 5;
	}
	.markdown-action > button {
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
	.markdown-action > button:before {
		content: ">\00a0";
		opacity: 0.5;
		display: inline-block;
	}
	.markdown-action > button:hover,
	.markdown-action > button:focus {
		color: var(--color-active-0);
		background: var(--background-active-5);
		text-decoration: 1.25px solid underline;
		outline: none;
		transition:
			background 0.3s,
			color 0.3s;
	}
	.markdown-action > input {
		display: block;
	}
	.markdown-action > input + input {
		margin-top: 2px;
	}
</style>
