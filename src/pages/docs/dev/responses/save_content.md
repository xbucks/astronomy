---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - save_content response
---

# `save_content`

The `save_content` response is requested by the [`load`](/docs/dev/actions/load) action and contains information about the action's load request along with the requested save data.

## responding action

- [`load`](/docs/dev/actions/load)

## properties

- **`error`** *(boolean)*  
  Whether the action encountered an error.

- **`message`** *(string?)*  
  Present when `error` is true, tells the reason why the action encountered an error. Valid values are:
  + `"no_account"`: The player was logged out.
  + `"empty_slot"`: The save slot is empty.
  + `"invalid_slot"`: The `slot` value was invalid.
  + `"server_error"`: The game couldn't connect to Galaxy's servers.
  
- **`slot`** *(number)*  
  The save slot number.

- **`label`** *(string?)*  
  The save's label, or `null` if `error` is `true`.

- **`content`** *(string?)*  
  The save's actual data, or `null` if `error` is `true`.

## examples

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
	slot: 0,
	content: null,
	label: null,
}
```
