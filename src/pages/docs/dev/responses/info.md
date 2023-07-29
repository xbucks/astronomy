---
layout: ../../../../layouts/Doc.astro
title: galaxy docs - info response
---

# `info`

The `info` response is first sent when the page loads, and may be sent multiple times after page load if any of the values inside change.

## properties

- **`galaxy`** *(boolean)*  
  Whether you're talking to Galaxy. This should always be `true`.

- **`api_version`** *(number)*  
  The version of the API. Will only increment for every breaking API change. It is not a bad idea to disable your implementation if this does not match.

- **`theme_preference`** *(string)*  
  The player's theme preference. Valid values are `none`, `light`, and `dark`. Use this to determine the color scheme of your game on the first startup.

- **`logged_in`** *(boolean)*  
  Whether the player is logged in. Certain features (like cloud saving) require the player to be logged into a Galaxy account in order to work.

## example

```js
{
	type: "info",
	galaxy: true,
	api_version: 1,
	theme_preference: "none",
	logged_in: false,
}
```
