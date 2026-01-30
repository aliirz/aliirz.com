---
layout: post
title: "Spec-Driven Development Made Easy: A Practical Guide with OpenSpec"
description: Stop vibe coding. Start spec coding. A walkthrough of spec-driven development using OpenSpec to build a mobile app from scratch.
date: 2026-01-30
tags: [sdd, openspec, ai-agents, mobile-dev]
image: "images/sdd-blueprint.jpg"
---

I've been vibe coding for the better part of a year. You know the drill. Open Cursor or Claude Code, type something like "build me a login screen with Google auth," and hope for the best. Sometimes it works great. Sometimes the AI hallucinates a library that doesn't exist, picks a routing strategy you hate, or quietly breaks something three files away.

The problem isn't the AI. It's us. We treat coding agents like search engines when we should be treating them like literal-minded pair programmers. They're excellent at following instructions. We're just bad at giving them.

That's where Spec-Driven Development comes in.

## What Is Spec-Driven Development?

Spec-driven development (SDD) flips the script. Instead of coding first and documenting later, you write structured intent that AI agents execute to generate the implementation. The specification is the source of truth, not the code.

Think of it like this: you wouldn't hand a contractor a vague description and say "build me a house, you'll figure it out." You'd give them blueprints. SDD is blueprints for AI agents.

The workflow breaks into four phases:

1. **Specify** - Write a plain-language markdown file defining the *what* and *why*. User goals, requirements, acceptance criteria. No technical "how-to" details yet.
2. **Plan** - Layer in the technical context. Tech stack, architectural patterns, security constraints. This is the "how" at a high level.
3. **Tasks** - Break the plan into small, reviewable steps. Each task should be atomic enough for an AI agent to implement without further clarification.
4. **Implement** - Feed these artifacts to an AI agent to generate code and tests that strictly adhere to the spec.

## Why Not Just Vibe Code?

Three reasons I keep coming back to:

**Reduced hallucinations.** Clear constraints in a spec prevent the AI from making "creative" guesses that cause bugs. When you tell it "use expo-router for navigation," it doesn't surprise you with react-navigation.

**Living documentation.** The spec is version-controlled next to the code. It never becomes a dusty artifact nobody reads. It *is* the thing that drives development.

**Better code reviews.** Reviewers evaluate changes against the original intent rather than trying to reverse-engineer the logic from code. "Does this match what we said we'd build?" is a much easier question than "What is this code trying to do?"

## The Tools

Several toolkits now automate the management of specifications:

- [**GitHub Spec Kit**](https://github.com/github/spec-kit) - An open-source toolkit providing slash commands (`/speckit.specify`, `/speckit.plan`) to automate branch creation, template generation, and task breakdown. Works with Copilot, Claude Code, and Gemini CLI.
- [**Amazon Kiro**](https://kiro.dev/) - An agentic development tool that guides you through requirements and design phases directly within an integrated environment.
- [**OpenSpec**](https://github.com/Fission-AI/OpenSpec) - A lightweight layer for brownfield *and* greenfield development that helps align humans and AI on changes before code is written. Supports 21+ AI tools.
- [**Tessl**](https://tessl.io/) - A platform where the specification itself is the maintained artifact, allowing code to be continuously regenerated.

For this walkthrough, I'm using OpenSpec. It's lightweight, open-source, and works with whatever AI coding assistant you already have.

## Building a Mobile App with OpenSpec: The Full Walkthrough

Let's say I want to build a React Native mobile app from scratch. Here's how I'd approach it using SDD with OpenSpec. The core loop is: **Propose → Plan → Implement → Archive**. You never just "ask" the AI to write code. You ask it to create a Change Proposal, align on the details, and only *then* authorize it to code.

### Prerequisites

- **Node.js** (v20.19+)
- **AI Coding Assistant**: Claude Code, Cursor, or Windsurf work best since they can read your file structure and run terminal commands

### Phase 1: Initialization & The "Constitution"

Before building anything, install the tool and set the ground rules.

{% highlight bash %}
npm install -g @fission-ai/openspec@latest

mkdir my-mobile-app
cd my-mobile-app

openspec init
{% endhighlight %}

This creates an `.openspec/` folder in your project.

Now the crucial part. Open `openspec/project.md` and edit it manually. This is your project's constitution — the non-negotiable constraints every future spec must respect.

Mine looks something like:

> This is a React Native app using Expo. We use TypeScript, Tailwind (via NativeWind) for styling, and Supabase for the backend. All navigation uses expo-router. We follow atomic design principles for components.

This is the single most important file in the whole process. Every time the AI generates a plan or writes code, it checks back against this constitution. It's how you stop the AI from "forgetting" your stack choices in Phase 4.

### Phase 2: The Base Build (Your First Change)

Instead of manually running `npx create-expo-app`, treat the project setup as your first spec change.

**Start the change:**

In your AI chat (Cursor, Claude Code, etc.), type:

{% highlight text %}
/opsx:new setup-project
{% endhighlight %}

Prompt: *"Create a proposal to scaffold a new React Native app with Expo and TypeScript. Include a basic home screen."*

**Generate the plan:**

{% highlight text %}
/opsx:ff
{% endhighlight %}

That's "Fast Forward." It generates the Proposal, Spec, Design, and Tasks all at once.

**Review the artifacts (this is the SDD magic):**

Don't let the AI code yet. Open the `openspec/changes/setup-project/` folder and check:

- **proposal.md** — Does it understand *why* we're doing this?
- **design.md** — Did it pick the right libraries? If it chose `react-navigation` instead of `expo-router`, correct it here. Before a single line of code exists.
- **tasks.md** — Are the steps specific and atomic? "Run init command," "Create directory structure," "Configure TypeScript."

This is where SDD earns its keep. You catch architectural misalignment *before* it becomes 500 lines of wrong code.

**Implement:**

Once you're satisfied with the artifacts:

{% highlight text %}
/opsx:apply
{% endhighlight %}

The AI executes the tasks file line by line — running terminal commands to scaffold the app, writing the initial code, all within the constraints you defined.

**Archive:**

Verify the app runs in your emulator, then:

{% highlight text %}
/opsx:archive
{% endhighlight %}

This merges your change into the "Main Spec" and clears the stage for the next feature.

### Phase 3: The Development Loop

Now you build every feature — Login, Profile, Camera, whatever — using the same cycle.

**Example: Adding a Login Screen**

{% highlight text %}
/opsx:new login-flow
{% endhighlight %}

Prompt: *"I need a login screen. It should support Email/Password and Google Auth. Use a dark theme consistent with our existing design tokens."*

{% highlight text %}
/opsx:ff
{% endhighlight %}

Now review:

- Did the spec include error states? (Password too short, network failure, invalid email)
- Is the design reusing your existing Button components or creating new ones?
- Does the tasks list include writing tests?

If anything's off, edit the markdown files directly. Then:

{% highlight text %}
/opsx:apply
{% endhighlight %}

Test the login. If it works:

{% highlight text %}
/opsx:archive
{% endhighlight %}

Rinse, repeat. Every feature follows the same loop.

## What I've Learned So Far

SDD isn't magic. It doesn't guarantee perfect code. But it does three things that vibe coding can't:

**It forces you to think before you build.** Writing a spec is harder than typing a prompt. That difficulty is the point. You catch bad ideas when they're cheap to fix — in a markdown file, not in a tangled dependency graph.

**It gives you a paper trail.** When something breaks in month three, you don't have to reverse-engineer intent from code. The spec tells you what you meant. The design tells you why you chose that approach. The tasks tell you what was supposed to happen.

**It makes AI agents dramatically more reliable.** Constraints reduce hallucinations. A well-specified task with clear boundaries produces better code than a vague open-ended prompt every single time.

The biggest mindset shift? Stop thinking of the AI as a coder. Think of it as a very fast, very literal contractor. You're the architect. The spec is the blueprint. The code is just the construction.

## Try It

If you want to get started, the barrier is low:

{% highlight bash %}
npm install -g @fission-ai/openspec@latest
mkdir your-project && cd your-project
openspec init
{% endhighlight %}

Edit your constitution. Write your first spec. Let the AI build from there.

Because the future of AI-assisted development isn't about writing better prompts. It's about writing better specs.

---

**Resources:**

- [OpenSpec on GitHub](https://github.com/Fission-AI/OpenSpec)
- [GitHub Spec Kit](https://github.com/github/spec-kit)
- [Thoughtworks: Spec-Driven Development](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices)
- [Red Hat: How SDD Improves AI Coding Quality](https://developers.redhat.com/articles/2025/10/22/how-spec-driven-development-improves-ai-coding-quality)
- [GitHub Blog: Spec-Driven Development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)

Photo by <a href="https://unsplash.com/@danielmccullough?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Daniel McCullough</a> on <a href="https://unsplash.com/photos/-FPFq_trr2Y?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
