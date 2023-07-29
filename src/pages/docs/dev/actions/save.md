---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - save action
---


# `save`

The `save` action creates a cloud save and then puts it into a certain save slot. If a save is already present in that slot, the old save will be overridden. The save result can be determined through the returning [`saved`](/docs/dev/responses/saved) response.

## returning response

- [`saved`](/docs/dev/responses/saved)

## parameters

- **`slot`** *(number)*  
  The save slot number. Must be an integer between 0 and 10, inclusive.

- **`label`** *(string?)*  
  The optional label of the save file. It is recommended for this to be a quick summary of the player's current progress (e.g. e1,000 points, Stage 64-25, Arcana level 308). Must be 100 characters in length or fewer.

- **`data`** *(string)*  
  The actual save data. Must be 64,000 characters in length or fewer.

## example

```js
window.top.postMessage({
	action: "save",
	slot: 0,
	label: "1,000 points",
	data: "{\"points\": 1000}",
}, "https://galaxy.click")
```
