---
layout: ../../../layouts/Doc.astro
title: galaxy dev docs
---

# galaxy dev docs

Welcome to the developer documentation! Here you'll find resources helping you integrate your game into the Galaxy API.

## setup

The Galaxy API uses [`window.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to allow cross-domain communication relatively seamlessly.

### receiving data

To listen to data from Galaxy, attach an event listener for the `message` event to `window`.

```js
window.addEventListener("message", e => {
	if (e.origin === "https://galaxy.click") {
		// It's a message from Galaxy!
		console.log(e.data);
	} else {
		// It may be an impostor! Probably best to ignore it.
	}
});
```

`e.data` will always be an object with the `type` property as a string. Other properties will only appear based on the value of `type`.

### transmitting data

Use `window.top.postMessage`. For specific data you should send up, see the other pages.

```js
window.top.postMessage({
	// action: "...",
	// ...
}, "https://galaxy.click");
```
