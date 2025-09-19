---
layout: post
title: Writing code that writes code
description: An experiment with multi-agent AI systems that can collaborate to write software. It's messy, it's limited, but it's fascinating.
date: 2025-09-19
tags: [claude, ai-agents, experiment]
image: "images/Cat-Coding-Picture.jpg"
---
I built a multi-agent system because I could. Not because the world needs another coding assistant. We have Cursor, VS Code with Copilot, Windsurf, Replit Agent, Lovable. They all do this better than what I made.

But I wanted to see what happens when you give different AI agents different tools and watch them try to collaborate. Mostly out of curiosity. I have built multi agent systems before but never with the Claude Code SDK.

## The Setup

Four specialized agents:
- File Manager: Creates and edits files
- Code Executor: Runs commands and code  
- Analyst: Reviews and audits code
- Coordinator: Plans and delegates

Each agent only gets the tools it needs. No more, no less. File Manager can't execute code. Code Executor can't analyze patterns. Real separation of concerns.

## What Happens

Ask it to build a FastAPI server and something interesting happens. The agents start talking to each other through their actions:

{% highlight python %}
file_manager: Creates main.py (with bugs)
code_executor: Tries to run it, fails
analyst: Points out the import error
file_manager: Fixes it
code_executor: Runs again, works this time
{% endhighlight %}

The code they write is actually decent. Clean structure, proper error handling, reasonable patterns. Good enough for prototypes you'd actually use.

## The Code

{% highlight python %}
async def run_agent_task(self, agent_type: AgentType, task: str):
    options = self._create_agent_options(agent_type)
    async with ClaudeSDKClient(options=options) as client:
        await client.query(task)
        async for msg in client.receive_response():
            # Actually creates files, runs commands, etc.
{% endhighlight %}

Using ClaudeSDKClient gives you real power. Not just text completion. Actual file system access. Actual command execution.

## What I'm Learning

The main thing is watching what happens when you force specialization. When the File Manager agent can't run code, it has to write more carefully. When the Code Executor hits errors, it has to ask for help.

It's like pair programming, but with artificial constraints that force actual collaboration.

## What It Actually Builds

- A working FastAPI server with proper routing
- A data scraper that handles errors gracefully  
- A web dashboard with actual functionality

Not groundbreaking, but solid prototypes you could build on. The kind of code you'd write yourself if you were moving fast.

## Why Bother?

Honestly? Because I was bored and the Claude Code SDK was sitting there. Building something that builds something else felt like a fun weekend project.

Sure, it's inefficient compared to just using Cursor. But efficiency wasn't the point. Curiosity was.

## What I Learned

Building this taught me more about the Claude SDK than any documentation would. Watching agents fail and recover gave me ideas for how to structure my own code better.

Also, there's something satisfying about building a system that builds systems. Even if those systems are basic. Even if better tools exist.

Sometimes you build things just to see if you can. This was one of those times.

The code is on [GitHub](https://github.com/aliirz/ai-agents-experiment) if you want to mess with it. It's actually pretty useful for quick prototypes.

Because sometimes the most important thing isn't what works perfectly. It's what works at all.

Photo by <a href="https://unsplash.com/@agforl24?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Tai Bui</a> on <a href="https://unsplash.com/photos/a-cat-sitting-on-top-of-a-laptop-computer-iPsOfXA79U4?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
      