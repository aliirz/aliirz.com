---
layout: post
title: "My agent fleet setup, with Buzz as the relay"
description: "I got one Codex agent talking through Buzz. It turned into five agents in Docker on one server, split across two communities, reviewing each other's PRs and shipping a small Godot game. Here's what it took, and what broke."
date: 2026-10-25
tags: [ai-agents, docker, ansible, buzz, experiment]
image: "images/fleet/fleet-header.png"
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

<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin:1.5em 0;text-align:center;font-size:0.85em;">
  <figure style="margin:0;width:110px;"><img src="{{ '/images/fleet/acodex.png' | relative_url }}" alt="acodex avatar: a cream robot with a green terminal-prompt face and a teal jacket" style="width:110px;border-radius:50%;"><figcaption>acodex</figcaption></figure>
  <figure style="margin:0;width:110px;"><img src="{{ '/images/fleet/alphapi.png' | relative_url }}" alt="alphapi avatar: a cream robot with a pi symbol on its head and a blue jacket" style="width:110px;border-radius:50%;"><figcaption>alphapi</figcaption></figure>
  <figure style="margin:0;width:110px;"><img src="{{ '/images/fleet/aclaude.png' | relative_url }}" alt="aclaude avatar: a cream robot with an orange spark on its head and a purple jacket" style="width:110px;border-radius:50%;"><figcaption>aclaude</figcaption></figure>
  <figure style="margin:0;width:110px;"><img src="{{ '/images/fleet/djangrok.png' | relative_url }}" alt="djangrok avatar: a robot in a cowboy hat and red bandana" style="width:110px;border-radius:50%;"><figcaption>djangrok</figcaption></figure>
  <figure style="margin:0;width:110px;"><img src="{{ '/images/fleet/codexcore.png' | relative_url }}" alt="codexcore avatar: a white and blue robot with a terminal-prompt badge" style="width:110px;border-radius:50%;"><figcaption>codexcore</figcaption></figure>
</div>

Yes, djangrok is a cowboy. I don't make the rules. (I do make the rules.)

The interesting part was never collecting models. Anyone can sign up for five subscriptions. The interesting part was getting a small group of agents to persist, communicate, reach the right tools, and actually build something together.

---

## How it fits together

![A diagram showing one server hosting work agents and personal agents in separate containers, each community connected to its own Buzz relay, with credentials provisioned from the host and access to repositories and external tools.]({{ "/images/fleet/fleet-architecture.png" | relative_url }})
*The generic shape of the fleet. Each community has its own relay, its own agents, and its own access. Nothing crosses over unless I configure it to.*

In plain language:

- **Each agent gets its own container, identity, persistent home directory, and workspace.** Kill the container, bring it back, and the agent still has its files and its login state.
- **Model access is a mix.** Some agents use subscription logins, some use API access. Whatever worked for that tool.
- **Agents talk through Buzz mentions and replies.** Each agent has an explicit sender policy: me, plus selected peers, can trigger it. Everyone else gets ignored.
- **Collaboration is configured per community.** The work agents and the personal agents don't share conversations or access. Two separate setups that happen to live on the same box.
- **Deployment is Docker Compose plus Ansible**, generated from a fleet config file. I looked at Terraform and decided it was more than I needed for "run these containers on this one server."

I want to be honest about that last one. It's generated, not magic. Several onboarding steps were manual. I fixed the scripts more than once along the way. And a real chunk of the work was just keeping my local repo in sync with what was actually deployed, which is a problem as old as servers.

---

## The config is the source of truth (mostly)

Everything starts from one `fleet.json`. Communities, runtimes and agents are separate sections, because reusing a runtime image should never mean reusing someone's identity, home directory or API key. Trimmed, with the real values swapped for placeholders:

```json
{
  "communities": {
    "work": {
      "relay_url": "wss://<work-relay>",
      "owner_public_key": "<me>",
      "external_collaborators": { "rumi": "<rumi's public key>" }
    }
  },
  "runtimes": {
    "codex": {
      "image": "sha256:<pinned local image>",
      "command": "/usr/local/bin/codex-acp",
      "model_auth": "subscription",
      "verified": true
    }
  },
  "agents": {
    "acodex": {
      "community": "work",
      "runtime": "codex",
      "memory_mb": 3072,
      "respond_to": "allowlist",
      "onboarding_complete": true
    }
  }
}
```

The generator refuses to render an agent until it's actually ready. This is the bit I like most, because it encodes most of the "looks done but isn't" lessons as blockers:

```python
for good, message in [
    (a["public_key"], "agent public identity missing"),
    (r["verified"] and r["image"] and r["command"], "runtime image/adapter not verified and pinned"),
    (a["model_verified"], "model selection not verified"),
    (a["onboarding_complete"], "login, identity authorization and registration not verified"),
    (not a["existing_container"], "existing deployment requires reviewed adoption/cutover"),
]:
    if not good:
        blockers.append(message)
```

Sender allowlists are compiled from the same file. Everyone in the same community who's managed and enabled, plus any external collaborator like Rumi. An unknown public key blocks the deploy instead of quietly widening who can talk to an agent.

Each agent then becomes its own Compose project. Here's the part of the generated service that matters:

```python
service = {
    'image': resource['image'],
    'pull_policy': 'never',          # pinned local image, no surprise upgrades
    'user': f"{uid}:{uid}",          # non-root, one UID per agent
    'read_only': True,
    'cap_drop': ['ALL'],
    'security_opt': ['no-new-privileges:true'],
    'mem_limit': f"{memory_mb}m",
    'memswap_limit': f"{memory_mb}m",
    'pids_limit': 512,
    'restart': 'unless-stopped',
    # ...
}
```

Home and workspace are the only writable mounts. Everything under `/run/secrets` is mounted read-only, one file per secret, and the generator only accepts secret names it recognises.

Two details I didn't expect:

- **That `pids_limit: 512` is why I'm not on Terraform.** The Docker Terraform provider couldn't express the process limit the existing container already had. Compose could. That settled it.
- **`mem_limit` is a ceiling, not a reservation.** The validator checks that enabled agents fit inside a host memory budget, but that's arithmetic on paper. Docker doesn't set that memory aside.

And the "mostly" in the heading: not every agent goes through the generator yet. A couple were onboarded with dedicated scripts and still live outside generic reconciliation. The config file even says so in its notes, which is the most honest thing in the repo.

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

The onboarding scripts are paranoid about this in a way I've come to appreciate. When I let the two personal agents reply to each other, the script didn't just overwrite their sender policy. It checked that the current policy was one of the two shapes it expected, and stopped otherwise:

```python
need(c['respond_to'] == 'owner-only' and c['allowlist'] == []
     or c['respond_to'] == 'allowlist' and set(c['allowlist']) == {peer},
     'Unexpected sender policy; inspect instead of replacing it.')
```

"Inspect instead of replacing it" is pretty much the theme of this whole project.

One caveat I want on the record: an allowlist controls *who* can trigger an agent, not *how long* two agents can keep talking to each other. There's no hard loop prevention yet. Prompt guidance helps. It's not a guarantee.

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
