---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - save_list action
---


# `save_list`

The `save_list` action sends a retrieval request to Galaxy to get the player's cloud save list which contains all the save data the player has. The actual save data then will be retrieved through the [`save_list`](/docs/dev/responses/save_list) response.

## returning response

- [`save_list`](/docs/dev/responses/save_list)

## example

```js
window.top.postMessage({
	action: "save_list",
}, "https://galaxy.click")
```
