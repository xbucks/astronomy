---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - actions
---

# actions

Actions are request messages by the game that are sent to Galaxy through the `window.top.postMessage` method. An example of such an action is:

```js
window.top.postMessage({
	action: "load",
	slot: 0,
}, "https://galaxy.click");
```

The argument object will always contain an `action` property describing which action to take, and then certain additional parameters that need to be included depending on the type of action. Below is a list of actions supported by Galaxy:

- [`supports`](actions/supports)

- [`save_list`](actions/save_list)

- [`save`](actions/save)

- [`load`](actions/load)
