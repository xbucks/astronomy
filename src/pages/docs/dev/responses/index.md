---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - responses
---

# responses

Responses are messages sent by Galaxy to the game, either as a certain message event or as a response to a previous action. To handle responses, attach an event listener for the `message` event to the game's `window`:

```js
window.addEventListener("message", e => {
	if (e.origin === "https://galaxy.click") {
		// It's a message from Galaxy!
		const data = e.data;
		console.log(data);
		// Additional code goes here...
	} else {
		// It may be an impostor! Probably best to ignore it.
	}
});
```

Here is an example of a possible response:

```js
{
	type: "saved",
	error: false,
	slot: 0,
}
```

The response object will always contain a `type` property describing which type of response it is, and then certain additional properties that are included depending on the type of response. Below is a list of response types that are used by Galaxy:

- [`info`](actions/info)

- [`save_list`](actions/save_list)

- [`save_content`](actions/save_content)

- [`saved`](actions/saved)
