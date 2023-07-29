---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - save_list response
---

# `save_list`

The `save_list` response is requested by the [`save_list`](/docs/dev/actions/save_list) action and contains the requested list of save data.

## responding action

- [`save_list`](/docs/dev/actions/save_list)

## properties

- **`error`** *(boolean)*  
  Whether the action encountered an error.

- **`message`** *(string?)*  
  Present when `error` is true, tells the reason why the action encountered an error. Valid values are:
  + `"no_account"`: The player was logged out.
  + `"server_error"`: The game couldn't connect to Galaxy's servers.
  
- **`list`** *(object)*  
  A list of saves. Each entry in the object is an object containing the save content (`content`) along with the label describing the save (`label`), with the id being its save slot number. Will be an empty object (`{}`) when `error` is `true`.

## examples

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
	list: {},
}
```
