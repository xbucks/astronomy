---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - supports action
---


# `supports`

The `supports` action tells galaxy what parts of the API you interact with, and hides/shows certain elements of the player accordingly.

## parameters

- **`saving`** *(boolean)*  
  If your game auto-saves or allows the user to make/load game saves from within the UI.

- **`save_manager`** *(boolean)*  
  If your game has a complete save manager integrated into it -- save deletion, export, import, labels, all save slots, etc.

## example

```js
window.top.postMessage({
	action: "supports",
	saving: true,
	save_manager: true,
}, "https://galaxy.click");
```
