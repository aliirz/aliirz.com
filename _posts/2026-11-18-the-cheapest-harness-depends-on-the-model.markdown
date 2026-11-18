---
layout: post
title: "The cheapest harness depends on the model"
description: "Runta and Baseten just published a huge harness leaderboard. The interesting result isn't a winner. It's that the cheap option for one model is expensive for another, and most of the spend goes to confident failures."
date: 2026-11-18
tags: [ai-agents, harness, evaluation]
image: "images/cheapest-harness-header.jpg"
---

In April I called it harness engineering: the layer that decides what a model knows when it starts, what it records while it works, and what survives when it stops. That post was a survey. Claude Code, Codex, LangGraph, CrewAI, Pi. Different answers to the same three questions. I had not measured any of them against each other.

Yesterday, Runta and Baseten did.

They published [FrontierHarness Eval v1.1](https://runta.com/blog/introducing-frontierharness-eval-v1-1/). Twenty-two harness setups, five open models, sixty-two terminal tasks, four attempts each. That is 27,280 agent runs and 83 billion tokens. The v1.0 board had ranked harnesses on a single model. This one asks the question that actually matters if you swap models the way I do: when you change the model, should you change the harness too?

The short answer is yes.

---

## A cheap option is a pair, not a brand

Each model had a different best-value harness. Their rule is the lowest cost per pass, unless another harness costs at most 30 percent more per pass and passes at least five points more often.

- Codex CLI with GLM-5.3
- Pi with GLM-5.3 Flash
- ZCode with DeepSeek V4.1 Flash 1017
- Oh My Pi with Muse
- Alma with Kimi-K3

That list looks tidy. The certainty behind it is not. They redrew the 62 tasks 4,000 times and picked the winner each time. Codex CLI stayed first with GLM-5.3 in 99.6 percent of those draws. The other four are the most likely of several close harnesses: Oh My Pi at 53 percent, ZCode at 47, Pi at 42, Alma at 25. A 25 percent winner is a maybe wearing a medal.

The cost ranks moved around even more. By cost per task, the median harness jumped 11 of 22 places when the model changed. Codex CLI went from 1st with GLM-5.3 to 16th with Kimi-K3. DeepSeek Harness: Creator moved from 1st with Muse to 21st with GLM Flash.

This is the result I keep coming back to. The harness is not a universal socket. It is a pair. Change one side and the cheap option stops being cheap.

The model still sets most of the bill. In their analysis it explains 92.8 percent of the variance of cost per task, which is what you'd expect when list prices differ by twenty times or more. But with the model fixed, the most expensive harness still cost 1.8 to 5.0 times as much per task as the cheapest, and 1.9 to 4.9 times as much per pass. They shuffled trials 300 times to see if that spread was noise. It wasn't.

A higher cost did not buy a higher pass rate. Across the five models, the rank correlation of cost per task and pass rate ran from -0.39 to +0.22. With four of the five, the most expensive harness per pass passed less often than the cheapest one.

Over all models, four harnesses sit on the Pareto line: OpenCode v2 at the low-cost end ($0.561 per task), then Pi, then Codex CLI, then ZCode at the high-pass end (61.9 percent). Everyone else cost up to 1.6 times as much and passed between 50.6 and 60.2 percent. Those pass-rate gaps come with a wide interval, about ±10 points, so a lead of a few points is a tie.

## Most of the money goes to a confident no

64.5 percent of the estimated inference cost went to trials that did not pass. 52.7 percent failed. 11.8 percent timed out.

The more irritating part is how the failures ended. With the five best-value harnesses, 68 to 82 percent of the failed runs stopped on a confident final answer, not at the time limit. Few said the work was incomplete. The traces show a model announcing that the tests passed, and a verifier showing that they did not.

I have watched that movie at home. A model saying it called a tool is not the tool call actually working. A happy `docker compose config` is not a running container. A confident final answer is not a pass.

They noted that a check before the harness stops could save part of that spend. They also said they did not test that. Good. That is the kind of sentence I want in a leaderboard post.

## Small is not cheap

I used to assume a smaller harness would be a cheaper harness. mini-SWE-agent had the smallest first request in the set, 882 tokens. It took 38 steps per pass and landed 17th of 22 on cost per pass, 19th on cost per task.

Prompt size, tool count, and cache hit rate did not predict cost per pass. Steps did. The rank correlation was +0.51. Every step sends the whole context again, so a trial used 2.0 to 4.8 million input tokens on average, depending on the harness. The largest first request was 21,365 tokens, less than one percent of that.

The five best-value harnesses share a few habits, offered as observations, not tests. One shell tool does most of the work. Each request only adds to the one before it, which keeps the cache hot. Almost no subagents. Almost no summaries.

Pi shows up here, which I like, because Pi has been honest about being small. Four tools: read, bash, edit, write. File searches go to bash. That is the same bet I wrote about in [April](/harness-engineering). The eval does not prove the bet is right. It does show that a minimal tool set is not, by itself, a reason to dismiss a harness, and a small prompt is not a reason to expect a small bill.

## What this is not

These are open models, served by one provider, [Baseten](https://x.com/baseten/status/2122768212177592359), at Baseten's cache and list prices. The authors say so. Another provider can move the cost ranks. Closed models can give different results. They plan to add those next, including Claude and GPT. Until then, this is not a shopping list for the fleet I actually run.

The tasks are terminal tasks, 15 minutes to 8 hours, scored in Harbor, with each harness on its default settings and maximum reasoning effort. Every trial got a fresh runtime. 216 trials were flagged for reward hacking, 163 of them for looking things up online, and those scored zero. Default settings are a fair way to test how people actually use a tool. They are not how I would tune a harness for my own work.

I have not rerun any of this. The numbers are theirs. The writeup and the [eval repo](https://github.com/frontier-harness-eval/eval) are there if you want to argue with the method, which you should, on your own tasks. Their own conclusion is the right one: test candidate harnesses with your model on a private dataset, large enough to see past the noise.

The same week, a [paper on arXiv](https://arxiv.org/abs/2611.22299) from Deep Shah and Nehal Kathrotia at Google sketched a framework for harnesses that rewrite themselves: diagnose failures, propose patches, validate, deploy. The claim is that gated, modular edits beat prompt reflection and full-harness rewrites on SWE-bench Lite, at a lower token cost, if you can keep the loop from gaming the benchmark or tampering with the evaluator.

That is a real direction. It is also the kind of claim I want to watch, not parade. A harness that improves itself is only useful if the improvements survive contact with work I actually care about, and if a human still gets to reject the clever ones. I have not run it.

---

The useful result from yesterday is smaller than a winner. The harness and the model are a pair. The cheap option moves. Most of the spend goes to runs that fail with a straight face. If you are going to switch models in a fleet, measure the harness again. Don't assume last month's cheapest setup is still the cheapest one.

There's a discussion on [Hacker News](https://news.ycombinator.com/item?id=50532191) if you want the comments.
