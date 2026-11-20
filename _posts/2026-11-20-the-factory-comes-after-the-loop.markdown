---
layout: post
title: "The factory comes after the loop"
description: "A colleague sent the team Lauren Tan's talk and said we need a software factory where agents write and review code. I started using her pstack yesterday and used it on a bug fix and a few features from my stack. It's a good tool, and it argues for a slower first step than the word factory suggests."
date: 2026-11-20
tags: [ai-agents, pstack, cursor, verification, workflow]
image: "images/the-factory-comes-after-the-loop-header.jpg"
---

A colleague sent the team a video of [Lauren Tan](https://x.com/poteto) talking about how she works with coding agents. The note with it said we need to build a software factory, where agents write the code and agents review it.

I started using her plugin, [pstack](https://github.com/cursor/plugins/tree/main/pstack), yesterday. Its main command is `/poteto-mode`. Poteto is her handle, and the mode is how she works with an agent, written down as files the agent has to read. Since then I've used it on a bug fix and a few features from my ticket stack. It's a cool way to work with the agent.

So this post is two things: what the tool actually says and does, read from the source, and what happened when I pointed it at real work. I'm also going to argue that it pushes back on the word my colleague used. Politely. With receipts.

---

## The talk says trust, not factory

Her talk at AI Engineer Code this month is called [All Code Is Slop (Except Mine)](https://ai.engineer/code/2026/talks/lauren-tan) ([video](https://www.youtube.com/watch?v=O_zcc6Xl12g)). The numbers in it are big. She says she shipped about 3,000 pull requests to production in a month, and that her team shipped about 11,000. Those are her numbers, from her team, and she doesn't give a baseline for the revert rate she quotes. I'm not going to repeat them as if I checked them.

The interesting part is what she says before the numbers. From the transcript, minus a couple of "uh"s:

> Some people like to call this a software factory. But I like to keep it simple and I think of it as all about trust.

And near the end:

> If your inner coding loop produces slop, then automating that loop just produces more slop.

She also says it took her six months to get there. That's the bit that never makes it into the forwarded link.

So my colleague isn't wrong. The factory is where she ended up. It's just not where she started. She started with one agent she couldn't trust and spent six months fixing that.

## What poteto mode actually is

pstack is a Cursor plugin, MIT licensed, in Cursor's own [plugins repo](https://github.com/cursor/plugins). It's also listed on the [Cursor marketplace](https://cursor.com/marketplace/cursor/pstack). The README is short and blunt:

> throughput without quality is not a goal i aspire to. if you want to go fast, go deep first.

Install is two lines in a Cursor chat. Then you prefix the task:

```text
/add-plugin pstack
/setup-pstack
```

```text
/poteto-mode users get two notifications after a retry. repro first, then fix and verify.
```

That second block is from her [guide](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/02-poteto-mode.md). "repro first" is not politeness. It changes what the agent does.

I cloned the repo to read it properly. The version I read is 0.15.46. It has 34 skills, 24 one-rule principle skills, 2 subagents, and 22 playbooks. The playbooks are tiny. All 22 together are 320 lines, and the longest is 25.

The core is [`poteto-mode/SKILL.md`](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md), about 110 lines. Here's the start of its non-negotiables, trimmed:

```markdown
## Non-negotiables

- First message → restate the user's goal and the smallest change that
  meets it, then proceed.
- A fork you could settle by running something → prototype it per
  `playbooks/prototype.md` instead of asking.
- Code → name the data shape first. Across a function boundary → **architect**.
  Fan-out → **swarm**. Bakeoff → **arena**. Contested design → **interrogate**.
- A number you measured → **benchmark-checklist**.
```

It's a router. It reads your task, picks a playbook (bug fix, feature, perf issue, refactoring, and so on), copies that playbook's steps into the agent's todo list word for word, and calls the other skills as the steps need them. The todo list is the trick. The agent can't quietly skip step 4 when step 4 is sitting there unchecked.

![Flow of a /poteto-mode run, from prompt to restatement, playbook, delegation, verification and PR]({{ "/images/pstack-poteto-mode-loop.svg" | relative_url }})
*One chat owns the playbook, the todo list and every subagent. A failed check goes back to a fresh delegate, not to you. Source: [pstack's poteto-mode skill](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md) and [playbooks](https://github.com/cursor/plugins/tree/main/pstack/skills/poteto-mode/playbooks).*

## Going deep means a smaller diff

"Go deep first" sounds like it means "do more." Reading the playbooks, it mostly means "prove more, ship less." The [bug fix playbook](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/bug-fix.md) is the clearest:

> Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is a hypothesis, not a fix. It does not ship.

It wants the agent to reproduce the bug itself, binary-search the cause with evidence, and stage the commits so the failing repro lands before the fix in git history. The [feature playbook](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/feature.md) makes the agent write a four-item "throughput checkpoint" before any fan-out: what blocks, what's independent, what state is shared, and the smallest safe split. If one worker is best, it has to say why.

Here's what changes compared to a bare prompt. The left column isn't a straw man. It's just what a plain prompt doesn't ask for.

| Moment | A bare prompt | What poteto mode's files say |
| --- | --- | --- |
| Before any code | Nothing required | Restate the goal and the smallest change that meets it |
| A choice it could test | Up to the model | Prototype it instead of asking |
| Who writes the code | The chat you're in | A `poteto-agent` delegate. The lead reviews the diff and writes its own summary |
| A bug fix | Up to the model | Repro first, evidence for every line, failing repro committed before the fix |
| "Done" | "It compiles," "tests pass" | Verified on the real surface. "Inconclusive" or wrong surface is not a pass |
| When it stops | Up to the model | Only for irreversible writes: force-push to shared branches, deploys, data deletion, customer messages |
| Its own report | Up to the model | Each claim gets evidence or a label: measured, inferred, or guess |

The autonomy section has one line I'd frame: "No is an acceptable answer." The agent is told it can decline scope and push back. Most agents treat agreement as the default. This one is told it isn't.

## Where the parallel agents come in

This is the part the factory pitch is about, so it's worth reading closely. pstack does fan out. It just puts the fan-out after the depth, never before.

| Skill | What it does, per its own file |
| --- | --- |
| `/swarm` | Splits work into slices, or races N workers on the same brief. One consolidated report, `PASS` / `ISSUES` / `BLOCKED` with evidence |
| `/arena` | N candidates build the same thing. A judge from another vendor scores them on a rubric, the lead picks a base and grafts in the best parts of the losers |
| `/interrogate` | Adversaries try to break a change. "A finding survives only when a run proves it" |
| `/correct` | Finds mistakes agents keep repeating in the repo and makes each one impossible |
| `/create-verification-skill` | Generates a project-local skill that drives your app the way a user does |

So yes: agents write, and agents review. My colleague's sentence is in there. But look at how the review is built. The arena judge has to come from a different vendor than the parent model. The interrogate brief throws out any finding nobody ran. The feature playbook says parent-level fan-out is for independent artifacts like audits and competing experiments. Coupled code goes to a single owner.

And the author is moving away from agent-on-agent review. Lauren [wrote on Nov 3](https://x.com/poteto/status/2117437607940681849):

> maybe a hot take but i now consider adversarial reviews mostly a waste of tokens. far better to use those tokens on empirical combined with formal verification.

She says in the same post she has updated pstack to use `/interrogate` less. The current mode file still routes contested designs to it, so that's in progress. The direction is clear, though. The review that counts is a run, not a second opinion.

It's the same point I made [yesterday](https://aliirz.com/code-got-cheap-checking-didnt), from the other side. Code got cheap. Checking it didn't. pstack spends its effort on the checking.

## Fix it once, in the repo

The skill I think a team should steal first is not poteto mode. It's [`/correct`](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md). It starts from a rude, accurate assumption about who is contributing:

> Assume every contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles.

Then it tells the agent where a fix should live.

![The five levels /correct tries, from architecture down to docs]({{ "/images/pstack-correct-ladder.svg" | relative_url }})
*Architecture first, docs last. About rules files, the skill says: "Nothing fails when an agent skips them." Source: [pstack /correct](https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md).*

Her talk has the same idea with real examples. Her team banned `useEffect` in product code. They split the Electron app into `electron-main` and `electron-renderer` folders and blocked imports between them. They banned about 99 percent of comments, because agents were writing comments to justify bad timers. In her words: "every time we correct our agents, it turns into one of these deterministic checks."

That's the actual factory floor. Not more agents. Fewer ways for any agent to be wrong.

## What happened when I used it

I didn't just read it. I used poteto mode on real work from my stack: a bug fix and a few features I was already working on.

It went well. Two things stood out right away.

**It was fast.** The work got done super quickly.

**The code was direct.** A lot less fluff and slop. Not a lot of comments. That lines up with what the files ask for: the smallest change, every shipped line backed by evidence. It also lines up with Lauren's team banning most comments outright.

Then I checked it. I have a swarm review skill I built myself. To be clear, that's my own skill, not pstack's `/swarm`. I ran it separately, after poteto mode was done, so the review wasn't coming from the loop that wrote the code. To my surprise, it found no issues. It was all good.

I want to be careful about what that means. A bug fix, a few features and one clean review is a good early signal. It is not proof, and a review that finds nothing doesn't mean nothing is there. But it's the right kind of signal. The whole point of going deep first is that the loop comes out trustworthy enough that an independent check has nothing to add. On a small sample, that's what happened. That's the trust Lauren says you build before the factory.

## What I ran, and what I didn't

Here's what I can honestly say I did. I read the mode file, the playbooks, and `/correct`, `/swarm`, `/arena` and `/interrogate` in full. pstack also ships a small TypeScript tool, `watch-pr`, that watches a PR stack and returns typed verdicts. Its tests run with Bun:

```text
$ cd pstack/skills/poteto-mode/scripts && bun test
 54 pass
 0 fail
 154 expect() calls
Ran 54 tests across 3 files. [197.00ms]
```

That proves the tool builds and its tests pass here. It says nothing about whether poteto mode makes code better. My tickets are the only evidence I have for that, and they're a handful. I'll trust it more after a few weeks of it catching things I would have shipped.

Some honest friction from the files:

- **It's opinionated about models.** Defaults name specific model slugs per role, and `/setup-pstack` writes a rule file to override them. Read what it picks before you let it spend.
- **It costs tokens on purpose.** Lauren says in the talk that most of her token use goes to verification. That's the design, not a bug. Budget for it.
- **It assumes you can verify.** "Verify on the real surface" needs a surface an agent can drive. If your app has no scripted way to run it, `/create-verification-skill` is step one, before any of the fun parts.

So, to my colleague: yes to the factory. But the first thing to build is one loop you'd trust while you sleep. Mine has started to look like one: a few tickets in, and an independent review came back clean. Get that loop right, then copy it. That's the order the person in the video took, and it took her six months.

## Resources

- [pstack on GitHub](https://github.com/cursor/plugins/tree/main/pstack) and on the [Cursor marketplace](https://cursor.com/marketplace/cursor/pstack)
- [The pstack guide: route work through /poteto-mode](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/02-poteto-mode.md)
- [All Code Is Slop (Except Mine), Lauren Tan, AI Engineer Code 2026](https://ai.engineer/code/2026/talks/lauren-tan) ([video](https://www.youtube.com/watch?v=O_zcc6Xl12g))
- [Lauren Tan on X](https://x.com/poteto)
