---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - cloud saving
---

# cloud saving

Galaxy offers free cloud saving for all players on all games on the site through its cloud saving feature. Each player has 11 save slots per game that can contain up to 64,000 characters per save slot, numbered from 0 to 10 (inclusive). It is conventional for the save slot number 0 to be the most commonly used save slot (i.e. slot used for auto-saving), and the remaining 10 save slots numbered from 1-10 to be accessed on request of the player (i.e. a player may want to split their save for each branching decision of a game with multiple endings).

Although implementing the cloud saving API is recommended for the best experience on the site, Galaxy allows manual cloud saving and loading by the player by copy and pasting the save string usually got through the game's save exporting / importing feature.

<note>

Galaxy does not support saving JavaScript objects directly -- you must convert your save data into a string in order to save it (and convert it back during loading). The easiest and most common way to do so is to use the [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) and [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) functions included within all modern browsers, though you may want to consider other options if you want smaller save strings and/or cheating prevention through save data modifying.

</note>

<note warning>

If you're using a big-number library like break_eternity.js, `JSON.stringify` will turn your `Decimal`s (or equivalent) into strings or JSON objects with their chained methods stripped away, which means certain usage like `a.plus(b)` might throw errors. You can circumvent this by detecting and converting all possible `Decimal`s inside the save data or using prototypal functions which check their types and convert them on the fly whenever needed (e.g. `Decimal.add(a, b)`).

</note>

---

## saving

The [`save`](/docs/dev/actions/save) action saves some save data into a certain cloud save slot.  
The save result is then returned through the returning [`saved`](/docs/dev/responses/saved) response.

```js
window.top.postMessage({
	action: "save",
	slot: 0,
	label: "1,000 points",
	data: "{\"points\": 1000}",
}, "https://galaxy.click");
```

If the save was successful:
```js
{
	type: "saved",
	error: false,
	slot: 0,
}
```

If it wasn't:
```js
{
	type: "saved",
	error: true,
	message: "too_big",
	// One of:
	// * "too_big"
	// * "no_account"
	// * "invalid_slot"
	// * "server_error"
	slot: 0,
}
```

---

## loading

The [`load`](/docs/dev/actions/load) action requests save data from a certain cloud save slot.  
The save data is then returned through the returning [`save_content`](/docs/dev/responses/save_content) response.

```js
window.top.postMessage({
	action: "load",
	slot: 0,
}, "https://galaxy.click");
```

If the save was found:
```js
{
	type: "save_content",
	error: false,
	slot: 0,
	label: "1,000 points",
	content: "{\"points\": 1000}",
}
```

If there was an error:
```js
{
	type: "save_content",
	error: true,
	message: "no_account",
	// One of:
	// * "no_account"
	// * "empty_slot"
	// * "invalid_slot"
	// * "server_error"
	slot: 0,
	content: null,
	label: null,
}
```

---

## listing

The [`save_list`](/docs/dev/actions/save_list) action requests a list of the cloud save slots that have been filled.  
The list of saves is then returned through the returning [`save_list`](/docs/dev/responses/save_list) response.

```js
window.top.postMessage({ action: "save_list" }, "https://galaxy.click");
```

If a list was found:
```js
{
	type: "save_list",
	list: {
		10: {
			label: "1,000 points",
			content: "{\"points\": 1000}",
		}
	}
}
```

If a list wasn't found:
```js
{
	type: "save_list",
	error: true,
	message: "no_account",
	// One of:
	// * "no_account"
	// * "server_error"
	list: {},
}
```
