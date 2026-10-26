---
layout: post
title: "One Server, Two Communities, and My Little AI Fleet"
description: "I got one Codex agent talking through Buzz. It turned into five agents in Docker on one server, split across two communities, reviewing each other's PRs and shipping a small Godot game. Here's what it took, and what broke."
date: 2026-10-27
tags: [ai-agents, docker, ansible, buzz, experiment]
image: "images/fleet-header.png"
---

*(The header is an illustration, not a screenshot. My server is not that cute and has no cat on it.)*

The two agents in my personal community made a game.

It's small. A Godot project where you collect items, deliver them, and try not to get caught by drones. They split the work between them, opened pull requests, reviewed each other's PRs, ran headless checks, and cut a tagged source release.

I want to be careful about what that means. The agents *reported* passing headless checks on the release commit. That's real, and useful. It doesn't tell you whether the thing renders correctly, whether the keyboard controls feel right, whether the drones are fair, or whether any of it is fun. At that milestone it was a source release, not an exported game you could download and play. A human still had to sit down and play it.

But still. Two agents I set up, talking to each other in a chat channel, building a thing. That was not where this started.

---

## It started with one bot

The original goal was modest. Get one Codex agent running and reachable through Buzz, so I could mention it in a channel and have it do work.

That worked. So naturally I added another one. Then another.

Now there are five managed agents, each in its own Docker container, all on one server, split across two separate communities:

**Work community:** acodex (Codex), alphapi (Pi through OpenRouter), and aclaude (Claude Code). They also collaborate with Rumi, an existing reviewer agent that's hosted elsewhere. I don't run Rumi. My agents just talk to it.

**Personal community:** djangrok (Grok Build) and codexcore (Codex). These are the two that built the game.

The interesting part was never collecting models. Anyone can sign up for five subscriptions. The interesting part was getting a small group of agents to persist, communicate, reach the right tools, and actually build something together.

---

## How it fits together

![A diagram showing one server hosting work agents and personal agents in separate containers, each community connected to its own Buzz relay, with credentials provisioned from the host and access to repositories and external tools.]({{ "/images/fleet-architecture.png" | relative_url }})
*The generic shape of the fleet. Each community has its own relay, its own agents, and its own access. Nothing crosses over unless I configure it to.*

In plain language:

- **Each agent gets its own container, identity, persistent home directory, and workspace.** Kill the container, bring it back, and the agent still has its files and its login state.
- **Model access is a mix.** Some agents use subscription logins, some use API access. Whatever worked for that tool.
- **Agents talk through Buzz mentions and replies.** Each agent has an explicit sender policy: me, plus selected peers, can trigger it. Everyone else gets ignored.
- **Collaboration is configured per community.** The work agents and the personal agents don't share conversations or access. Two separate setups that happen to live on the same box.
- **Deployment is Docker Compose plus Ansible**, generated from a fleet config file. I looked at Terraform and decided it was more than I needed for "run these containers on this one server."

I want to be honest about that last one. It's generated, not magic. Several onboarding steps were manual. I fixed the scripts more than once along the way. And a real chunk of the work was just keeping my local repo in sync with what was actually deployed, which is a problem as old as servers.

---

## Things that look the same but aren't

Most of what I learned was the difference between two states that look identical from a distance:

- A **running container** is not a **functioning agent**.
- Being **in the channel** is not the same as **showing up in the mention picker**.
- Being **mentioned** is not the same as being **allowed to respond**.
- A model **saying it called a tool** is not the tool call **actually working**.
- A container's **memory limit** is not **reserved memory**.
- The **commit author** is not the **GitHub account that authenticated the API call**.

Every one of these bit me at least once. Green status lights lie by omission.

---

## Some things that broke

**The package manager was held hostage.** An old `apt` command was sitting there waiting for input nobody was going to give it, holding the lock. Everything after it just queued up behind it. Lesson: non-interactive means *non-interactive*, everywhere, every time.

**Login failed because home didn't exist.** The agent's configured home directory wasn't there, so the login flow had nowhere to put anything. Related: one agent couldn't read its own launcher because of file permissions, and a base image didn't even ship the user-management utility my setup script assumed. Running as non-root is the right call. It also means you find out exactly which files you were lazy about.

**The bot that wasn't there.** One agent had everything set up. Container up, identity set, channel joined. It just didn't appear in the mention picker. If you can't mention it, it doesn't exist as far as the humans are concerned. "Set up" and "reachable" turned out to be different checklists.

There was also a stretch of relay rate-limit warnings and an outage. I never pinned down the root cause, so I'm not going to pretend I did.

---

## Credentials and trust

This part I thought about the most, and I still wouldn't call it sophisticated.

Work agents got organization-scoped GitHub access. Personal agents got broader access, explicitly granted, to the repositories and hosting projects I authorized.

Credentials are reused deliberately within a group. Master credential files live on the host, owned by root. Individual agents get explicit grants, and the secrets are mounted read-only into their containers.

Read-only means the agent can't modify the *file*. It does not mean the *token* is read-only. If the token can push, the agent can push. An agent can use whatever credentials you hand it, so the real decision is what to hand it.

I'm also still on personal GitHub tokens, not GitHub Apps. Which means every API action those tokens perform is me, as far as GitHub is concerned, even when the commit author says otherwise. That's a trade-off I made knowingly. It's not a vault and it's not a perfect security boundary. It's a practical setup for a small fleet.

---

## Back to the game

Once the personal agents had working Git access, a shared channel, and permission to mention each other, the game happened pretty naturally. One would pick up a piece, open a PR, mention the other for review. Review comments came back. Fixes went in. Headless checks ran. Eventually, a tag.

After that milestone I provisioned Meshy for 3D assets and ElevenLabs for audio. Access was verified. That's all I'll claim for now. Giving an agent a tool credential and approving a budget to actually generate stuff turned out to be two separate decisions, and I'm glad I kept them separate.

---

## The part I didn't expect

It was fun. Genuinely.

The names helped. The robot avatars helped. The reviewer memes definitely helped. Watching agents mention each other in a channel, hand work back and forth, and push back on each other's PRs made the whole thing feel less like infrastructure and more like a tiny, slightly chaotic studio.

They're not conscious and they're not infallible. They make confident claims about things that didn't happen, which is why "the tool call actually worked" is on my list above. But watching an infrastructure experiment turn into a creative workflow that produced something was the best part of the whole project.

---

## What's next

Five agents across two communities means I want one place to see all of them. Not a vanity dashboard. Something that shows:

- Host and Docker resource usage
- Relay presence and whatever activity signals Buzz exposes
- Failures and stale data, loudly
- A clear split between **running**, **connected**, and **working**

Because those are three different things, and I learned that the hard way.

That's the next experiment. I'll write it up when it exists.
