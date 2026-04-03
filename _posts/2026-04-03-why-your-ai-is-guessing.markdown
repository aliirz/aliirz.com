---
layout: post
title: "Spec-Driven Development with AI: Why Your AI Is Guessing (And How to Stop It)"
description: "Hallucinations aren't an AI problem. They're a communication problem. This is the mindset shift at the core of spec-driven development with AI."
date: 2026-04-03
tags: [sdd, ai-agents, openspec, spec-driven-development]
image: "images/ai-guessing.png"
---

There's a moment every developer has felt. You give an AI a task. It comes back confident, producing code that almost works. The logic is plausible. The syntax is clean. And then you realize it invented a function that doesn't exist, picked the wrong library, or quietly changed a data model three files away from where you were looking.

You call it a hallucination. I call it a communication failure.

The AI did not fail you. You failed to brief it.

## The Briefing Problem

Think about how you actually hand off work to a contractor. You don't walk up to a plumber and say "fix the water situation in the kitchen, you'll figure it out." You describe the symptoms, show them the pipes, tell them what you've already tried, specify what can't be touched, and agree on what done looks like.

AI agents are contractors. Very fast, very literal contractors who will execute exactly what you communicate to them, not what you meant. The gap between what you mean and what you say is where every hallucination lives.

Most developers are still in the "you'll figure it out" phase. They write a sentence or two, hit enter, and treat the output like a lottery ticket. Sometimes it's great. More often it's plausible garbage that takes longer to fix than to rewrite.

Spec-Driven Development is the system that closes that gap.

## What SDD Actually Is

SDD is not a tool. It's not a library. It's a communication discipline.

The core idea: before you let an AI write code, you write a structured document that captures your intent, your context, your constraints, and your definition of done. That document is the spec. The AI executes against the spec, not against your vibes.

There are four things a good spec contains:

**Context.** What problem are you solving and why does it exist? The AI needs to understand the shape of the situation before it touches anything. "Add a login screen" is ambiguous. "Add a login screen to a React Native app using Expo Router, where the auth session is managed by Supabase, and the design system uses NativeWind" is not.

**Constraints.** What is not negotiable? The library. The naming convention. The folder structure. The error handling approach. Constraints are not limitations on the AI. They're the boundaries inside which creativity is actually useful.

**Tasks.** What are the atomic steps to get from here to done? A task is small enough that the AI can complete it without asking a clarifying question. If a task requires judgment, it needs to be two tasks with the judgment made in writing first.

**Acceptance criteria.** What does done look like? If you can't write this down, you don't actually know what you want yet. That's fine. Write it down until you do. The spec catches unclear thinking before it becomes unclear code.

## A Concrete Before and After

Here's the kind of prompt that produces lottery-ticket results:

> "Build a user profile screen that shows the user's info and lets them edit it."

And here's what that looks like when you brief it properly:

{% highlight text %}
Context:
We're adding a profile screen to an existing React Native app using
Expo Router. User data lives in Supabase under the `profiles` table.
Auth is already configured.

Constraints:
- Use NativeWind for all styling. No new dependencies.
- Edit form must handle optimistic updates and roll back on failure.
- Use existing Button and TextInput components from @/components/ui.

Tasks:
1. Create app/(tabs)/profile.tsx with read-only view of display_name,
   avatar_url, and bio
2. Add Edit button that toggles inline form fields for those three values
3. On save, call updateProfile() with optimistic UI update, roll back on error
4. Show loading skeleton during initial data fetch

Done when:
- User can view and edit profile without a full page reload
- Changes persist in Supabase
- Errors show a toast notification
{% endhighlight %}

Same feature. Completely different conversation. The second one produces code you can actually ship.

## This Is Not More Work

The pushback I always hear: "that takes too long, I'll just iterate faster."

You won't. You'll iterate at the same speed, but the iterations will be bigger and more expensive. Fixing a wrong architectural decision in week three costs ten times more than writing a constraint in week one. The spec looks like overhead until you've spent two hours untangling code that confidently went in the wrong direction.

Writing a spec for a focused feature takes ten minutes. It saves you the first revision almost every time.

The other thing: once you have the spec, you have the documentation. You don't have to write it later. You don't have to reverse-engineer intent from code six months from now. The spec is the paper trail. Check it into git next to the code and it stays honest.

## The AGENTS.md Concept

Here's how seriously the best SDD tooling takes this communication problem. OpenSpec has a file called `AGENTS.md` — sometimes described as "a README for robots." It's not documentation for humans. It's a document where you tell your AI agents exactly how to read your project, how to format their output, and how to follow your workflow.

Think about that for a second. You're writing instructions for the AI about how to receive instructions. That's the level of explicitness that actually eliminates guessing. Most hallucinations happen not because the AI is wrong, but because it filled in a gap you didn't know existed. `AGENTS.md` closes those gaps at the system level, not feature by feature.

You don't need a special tool to start doing this. A `CLAUDE.md` or a `AGENTS.md` in your project root, with your stack, your conventions, and your non-negotiables, gets you 80% of the way there today.

## The Mindset Shift

The real change isn't in your tools. It's in how you see your role.

When you vibe code, you're a typist hoping the AI figures it out. When you spec, you're a systems designer who gives the AI something solid to execute against.

That shift feels small. The results are not.

In the next article in this series, I'm going to break down the anatomy of a great spec in detail, with a real project and annotated templates you can steal. If you want to follow along, the companion template is below.

---

**Next in the series:** [Anatomy of a Great Spec](#) (coming next)

**Companion asset:** [Spec vs. Prompt Cheat Sheet](https://github.com/aliirz/sdd-series/blob/main/01-spec-vs-prompt-cheatsheet.md)

**Resources:**

- [OpenSpec on GitHub](https://github.com/Fission-AI/OpenSpec)
- [Getting Started with SDD](https://aliirz.com/getting-started-with-sdd) (my original walkthrough)
- [Addy Osmani: How to Write a Good Spec](https://addyosmani.com/blog/good-spec/)
