---
layout: ../../layouts/Doc.astro
title: galaxy docs - chat
---

# chat 💬

Galaxy provides a free, barebones chat service for games on it. Channels have messages and moderators -- that's about it for now.

There are two places you can access chat from: game pages (hereforth the "chat dock") and the [chat page](/chat).

If you're a game developer and wish to create a channel for your game, go to the edit page for your game, scroll to the bottom, and click the <button>enable chat</button> button.

Although it is possible to make chat channels not linked to a game, you can not make one automatically at the moment. If you want one, please contact us on our [Discord server](/discord).

# moderation 🔨

You need to use the chat page to moderate your channel -- the chat dock will not suffice (yet). After you've opened up your channel, you can add moderators and admins, delete messages, ban people, and disable the channel.

## moderators vs. admins

At the moment, there is no difference between the two. However, in the future, administrators will be able to lock channels and manage moderators.

<!-- Moderators can delete messages, and ban/unban people.

Admins can do what moderators can, plus promote moderators and disable the channel.

Only the owner can promote and demote admins. -->

## reporting messages

Chat staff are picked by the owner of a chat room, and can mute people and delete chat messages in only that chat room.

Site staff are picked by the owners of Galaxy, and are not supposed to moderate individual chat rooms. They review reports, and moderate everything else on Galaxy.

When you report a message, it is sent to the **site staff**. Messages are sent with plenty of context to make sure nothing is taken out of context.

## mutes

Moderators and administrators may choose to mute people they deem as problematic. Muted accounts can not contribute to the chat by sending messages to the channel.

# webhooks ⛓

Galaxy makes use of webhooks to allow for you to stay up-to-date without needing to have a tab open to your chat window 24/7.

**Webhooks are one-way.** You can see messages sent from Galaxy, but people on Galaxy can not see your messages!

At the moment, there is only one type of webhook: `auto`. However, this should be enough to meet all your needs.

It has been confirmed to work on:
- Discord
- Guilded

It *may* work on:
- Slack
- Matrix
- Apprise
- Google Chat

It is safe to use the Discord webhook on a public server. We have specifically set it up so it can't ping people.

# disabling

Although you can not delete a channel, you can disable it, preventing new messages from being sent.

You need to be the owner of a channel to disable it.
