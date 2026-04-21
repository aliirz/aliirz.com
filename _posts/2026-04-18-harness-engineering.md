---
layout: post
title: "Harness engineering: the layer everyone's building and nobody's naming"
description: "Claude Code, Codex, LangGraph, CrewAI — they all have different answers to the same question: what happens to your agent's knowledge when the session ends? Here's why that question matters, how each system answers it, and why I ended up building on top of one that gets it right."
date: 2026-04-18
tags: [ai-agents, claude, memory, open-source, engineering]
image: "images/Horse-Harness-on-Dark-Surface.png"
---

Every serious AI coding setup has a hidden layer underneath the model. It's not the model. It's not the IDE plugin. It's the infrastructure that decides what the model knows when it starts, what it remembers while it works, and what survives after it stops.

I've been calling this harness engineering. Nobody else seems to be using that term, but the problem is real and every team building with AI is solving it — mostly in silence, mostly from scratch.

---

## What the problem actually is

LLMs are stateless. Every session starts cold. The model has no memory of the deploy that broke prod last Tuesday, no recollection of the architectural decision you spent three hours debating, no awareness that you've already rejected this particular approach twice before.

You end up re-explaining your stack. Re-establishing constraints. Watching the model repeat mistakes you've already corrected. The cost isn't just time — it's trust. You stop relying on the model for anything that requires context, which is most of what matters.

A harness is the infrastructure layer that fixes this. At minimum it answers three questions:

- **What does the model know at the start of a session?**
- **What gets recorded while the model works?**
- **What survives when the session ends?**

The answers vary wildly depending on which system you're using.

---

## How the main systems answer these questions

### Claude Code

Claude Code has CLAUDE.md — a markdown file that gets injected into context at session start. You write it manually. It's useful but static: it knows what you told it, not what it observed.

More recently (v2.1.59+), Anthropic added Auto-Memory: a background system that watches your sessions, extracts insights, and saves structured summaries to disk automatically. It's early, but it's the right direction.

The gap: CLAUDE.md doesn't update itself. Auto-Memory helps but isn't yet a full episodic layer. There's no built-in mechanism for the model to review what it learned last week and decide what's worth keeping permanently.

**What survives a session:** Whatever you manually put in CLAUDE.md, plus Auto-Memory summaries if enabled. No automatic learning.

---

### OpenAI Codex CLI

Codex has persistent memory in preview — but it's enterprise/edu only, rolling out slowly, and region-delayed. It remembers preferences, coding style, and recurring patterns across sessions.

The integrations are impressive (GitHub, Notion, Slack, Google Workspace). But integrations retrieve external context — they don't synthesize it. There's no mechanism for Codex to notice a recurring failure pattern and promote it to a standing rule.

**What survives a session:** Limited, where available. No automatic learning from patterns.

---

### LangGraph

LangGraph has the most mature persistence story of the framework-layer options. State checkpoints to a database per thread. Long-term memory via vector stores. MongoDB integration for cross-session recall. Interrupt-and-resume for human-in-the-loop workflows.

The downside is configuration overhead. The default is amnesia — you have to explicitly wire a checkpointer and a vector store to get persistence. Most deployments don't. And even when they do, vector similarity retrieval can miss context that's semantically important but lexically distant from your current query.

**What survives a session:** Everything, if you configured the backend. Nothing, if you didn't.

---

### CrewAI

CrewAI has the most ambitious memory model right now. Their 2026 Unified Memory API collapses short/long/entity/external memory types into one LLM-analyzed class with composite scoring (semantic similarity + recency + importance). Cognitive Memory adds agent-driven recall flows that proactively surface context.

ChromaDB + SQLite as the default backend means persistence works out of the box. The scoping system (/, /project/alpha, /agent/researcher/findings) handles multi-agent setups cleanly.

The risk: encoding and recall flows can disagree on importance. Agents may over-weight recency. And it's tied to the CrewAI framework — you can't take your memory layer to a different tool.

**What survives a session:** Full memory hierarchy, if the database persists. Learning is automatic but not human-validated.

---

### AutoGen

AutoGen's memory is an afterthought. The default is stateless. You can plug in ChromaDB, Redis, Neo4j, Mem0 — but nothing is configured out of the box, and the framework itself is now in maintenance mode as Microsoft shifts focus to their broader Agent Framework.

**What survives a session:** Nothing by default. Optional external backends if you wire them yourself.

---

## The problem none of them fully solve

Every system above has at least one of these gaps:

1. **No episodic layer** — no record of what the model actually did, tool by tool, session by session
2. **No promotion mechanism** — no way for recurring patterns to graduate from observations to permanent rules
3. **Not portable** — memory is locked to the framework; switching tools means starting over
4. **No human review gate** — automatic learning means automatic mistakes at scale

Most tools pick two or three of these to solve. None of them address all four cleanly.

---

## Why I use agentic-stack

[agentic-stack](https://github.com/codejunkie99/agentic-stack) is not a framework. It's a portable `.agent/` folder — a structured memory system that plugs into whatever AI harness you're actually using: Claude Code, Cursor, Windsurf, OpenCode, or a custom Python setup.

The memory structure is four layers with distinct retention policies:

- **working/** — current task state, cleared when done
- **episodic/** — timestamped records of what actually happened, tool by tool
- **semantic/** — durable lessons that survived human review
- **personal/** — your preferences, constraints, and how you like to work

The **dream cycle** runs at session end. It clusters episodic entries by content similarity, scores them by salience (frequency × recency × pain_score), and stages high-salience candidates for review. A human validates before anything enters semantic memory. No automatic promotion, no silent mistakes.

**Recall** runs before any risky operation — deploy, migration, schema change. It surfaces the most relevant past events. Not just similar keywords, but events that mattered.

The portability is the differentiator. Your `.agent/` folder moves with you. Switch from Claude Code to Cursor, the memory comes along. Switch from Cursor to a custom agent — same thing. Your knowledge isn't owned by the framework.

---

## Why this framing matters now

Six months ago, "just use Claude" was a reasonable answer for most coding tasks. Today, teams are running multi-session workflows, building internal agents with persistent context, and making architectural decisions that depend on the model having accurate memory of what was tried before.

The infrastructure layer is no longer optional. The question is whether you're building it intentionally or stumbling into it one CLAUDE.md edit at a time.

Harness engineering is the discipline of building that layer well. It's worth naming, worth thinking about explicitly, and worth getting right before your agent's memory becomes a liability rather than an asset.

---

