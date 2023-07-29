---
layout: ../../../../layouts/Doc.astro
title: galaxy docs -  saved response
---

# `saved`

The `saved` response is requested by the [`save`](/docs/dev/actions/save) action and contains information about the action's save request.

## responding action

- [`save`](/docs/dev/actions/save)

## properties

- **`error`** *(boolean)*  
  Whether the action encountered an error.

- **`message`** *(string?)*  
  Present when `error` is true, tells the reason why the action encountered an error. Valid values are:
  + `"too_big"`: The save data exceeded the 64,000 character limit.
  + `"no_account"`: The player was logged out.
  + `"invalid_slot"`: The `slot` value was invalid.
  + `"server_error"`: The game couldn't connect to Galaxy's servers.
  
- **`slot`** *(number)*  
  The save slot number.

## examples

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
	slot: 0,
}
```
