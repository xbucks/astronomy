---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - load action
---


# `load`

The `load` action sends a retrieval request to Galaxy to get the cloud save data inside a certain save slot. The actual save data will then be retrieved through the [`save_content`](/docs/dev/responses/save_content) response.

## returning response

- [`save_content`](/docs/dev/responses/save_content)

## parameters

- **`slot`** *(number)*  
  The save slot number. Must be an integer between 0 and 10, inclusive.

## example

```js
window.top.postMessage({
	action: "load",
	slot: 0,
}, "https://galaxy.click");
```
