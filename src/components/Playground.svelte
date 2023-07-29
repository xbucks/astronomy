<script lang="ts">
	let input: HTMLTextAreaElement;
	let value = "";

	const parseJSON = (data: string) => {
		try {
			return JSON.parse(data);
		} catch (e) {
			alert(`${e}`);
		}
	};

	const stringifyJSON = (data: unknown) => JSON.stringify(data, null, "\t");

	// log
	type LogEntry = {
		id: number;
		type: "action" | "response";
		content: string;
		time: Date;
	};
	let log: LogEntry[] = [];

	let counter = 0;
	const addLogEntry = (type: "action" | "response", content: string) => {
		log.push({
			id: counter++,
			type,
			content,
			time: new Date(),
		});
		log = log;
	};

	// templates
	const templateGenerators = {
		Save: () => `{
	"action": "save",
	"slot": 0,
	"data": "5 points",
	"label": "Autosave - ${new Date().toLocaleString()}"
}`,
		Load: () => `{
	"action": "load",
	"slot": 0
}`,
		"List Saves": () => `{
	"action": "save_list"
}`,
	};

	type TemplateName = keyof typeof templateGenerators;

	const templateNames: TemplateName[] = ["Save", "Load", "List Saves"];

	const useTemplate = (templateName: TemplateName) => () => {
		value = templateGenerators[templateName]();
	};

	const onUpdate = (e: KeyboardEvent) => {
		if (e.key == "Tab") {
			e.preventDefault();
			const start = input.selectionStart;
			const end = input.selectionEnd;

			// set textarea value to: text before caret + tab + text after caret
			value = value.substring(0, start) + "\t" + value.substring(end);

			// put caret at right position again
			input.selectionStart = input.selectionEnd = start + 1;
		}
	};

	const onSend = () => {
		const message = parseJSON(value);
		if (message === undefined) return;

		window.parent.postMessage(message, window.location.origin);
		addLogEntry("action", stringifyJSON(message));
	};

	const onCopyJS = () => {
		const message = parseJSON(value);
		if (message === undefined) return;

		const content = `window.parent.postMessage(${stringifyJSON(
			message
		)}, "https://galaxy.click");`;
		window.navigator.clipboard.writeText(content);
	};

	if (window !== window.parent) {
		window.addEventListener("message", ({ data }) => {
			addLogEntry("response", stringifyJSON(data));
		});
	}
</script>

<div id="grid">
	<div id="header">
		<h2>welcome to the playground!</h2>
		<p>
			here you can fully tinker with and test all of galaxy's iframe API
			to get a feel for it.
		</p>
	</div>
	<div id="send">
		<h3>Templates</h3>
		{#each templateNames as templateName}
			<button class="template" on:click={useTemplate(templateName)}
				>{templateName}</button
			>
		{/each}
		<textarea
			placeholder="Write JSON. It will be parsed and then sent."
			on:keydown={onUpdate}
			bind:this={input}
			bind:value
		/>
		<button on:click={onSend}>Send</button>
		<button on:click={onCopyJS}>Copy as JavaScript</button>
	</div>
	<div id="log">
		{#each [...log].reverse() as entry (entry.id)}
			<div class="entry">
				<h4 class="entry-info">
					{entry.type} &mdash; {entry.time.toLocaleString()}
				</h4>
				<pre class="entry-content">{entry.content}</pre>
			</div>
		{/each}
	</div>
</div>

<style>
	@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Roboto&family=Noto+Emoji&family=Inter&display=swap");

	#grid {
		margin: 10px;
		height: calc(100vh - 20px);
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 125px 1fr;
		grid-template-areas:
			"header header"
			"send   log";
		gap: 10px;
	}

	#grid > div {
		border-radius: 25px;
		border: solid medium #888;
		padding: 10px;
	}

	#header {
		text-align: center;
		grid-area: header;
	}

	#send {
		grid-area: send;
	}

	#log {
		overflow: scroll;
		grid-area: log;
	}

	button {
		background: #333;
		color: #bbb;
		border: solid medium #888;
		border-radius: 25px;
		margin: 5px 0;
		width: 100%;
		font-size: 20px;
		font-family: "JetBrains Mono";
		cursor: pointer;
	}

	textarea {
		width: calc(100% - 30px);
		resize: none;
		height: calc(100% - 310px);
		background: #222;
		color: #bbb;
		border: solid medium #888;
		border-radius: 25px;
		padding: 10px;
		font-size: 20px;
		tab-size: 4;
	}

	.entry {
		background: #333;
		color: #bbb;
		border: solid medium #888;
		border-radius: 25px;
	}

	.entry:not(last-child) {
		margin-bottom: 10px;
	}

	.entry-info {
		font-size: 20px;
		margin: 10px;
	}

	.entry-content {
		margin: 20px;
		tab-size: 4;
		max-height: 100%;
		overflow: auto;
	}
</style>
