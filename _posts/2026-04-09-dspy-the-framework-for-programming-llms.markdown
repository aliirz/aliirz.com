---
layout: post
title: "DSPy: The Framework for Programming LLMs (Not Prompting Them)"
description: "After two years of building with DSPy, I wrote down everything I learned. Here's what changed about how I work with LLMs."
date: 2026-04-09
tags: [dspy, llm, python, machine-learning]
image: "images/dspy-framework.jpg"
---

I spent two years prompting LLMs before I found DSPy.

The cycle was always the same. Write a prompt. Test it on five examples. It works. Ship it. Then an edge case breaks. Add "IMPORTANT:" to the prompt. Works for two days. Model update changes behavior. Rewrite from scratch.

I had folders of prompts. `v1.txt`, `v2_final.txt`, `v2_final_REALLY_final.txt`. None of them documented *why* they worked. When something broke, I couldn't tell if it was the prompt, the model, or the data. No version control. No tests. Just vibes.

Then I found DSPy.

## What DSPy Actually Does

DSPy is a framework from Stanford NLP. The idea is simple: you don't write prompts. You write Python.

```python
class AnalyzeStartup(dspy.Signature):
    """Analyze a startup pitch."""

    pitch: str = dspy.InputField()
    viability_score: int = dspy.OutputField()
    strengths: list[str] = dspy.OutputField()
    weaknesses: list[str] = dspy.OutputField()
    verdict: str = dspy.OutputField()
```

That's a Signature. It declares inputs, outputs, and types. DSPy compiles this into a prompt. When you need better prompts, you run an optimizer and DSPy rewrites them based on examples that work.

The mental model shift: LLMs become function calls. You declare the interface. The framework handles the implementation.

## What Changed

**I stopped memorizing prompt tricks.**

Before DSPy: "If I put examples before instructions, it works better. Sometimes. Unless it's GPT-4o. Then I need to structure it differently."

After DSPy: I write a Signature. DSPy figures out the best prompt format. The prompt becomes an implementation detail. I care about inputs, outputs, and behavior.

**I can finally test my LLM code.**

```python
def test_startup_analyzer():
    result = startup_analyzer(pitch="We're building AI for dog grooming...")
    assert 1 <= result.viability_score <= 10
    assert len(result.strengths) > 0
    assert len(result.weaknesses) > 0
```

Real tests. In my test suite. With assertions. This alone changed how I think about LLM applications.

**Model swaps are one line.**

```python
lm = dspy.LM("openai/gpt-4o-mini")
# lm = dspy.LM("anthropic/claude-3-sonnet")
# lm = dspy.LM("gemini/gemini-2.0-flash")

dspy.configure(lm=lm)
```

Same code. Different model. DSPy handles the prompt translation. Before, every model needed prompt tuning. GPT-4 liked prompts one way. Claude another. Gemini another. Prompts were coupled to specific models. Now they're not.

**Optimizers do the tuning for me.**

```python
optimizer = BootstrapFewShot(metric=my_metric, max_bootstrapped_demos=4)
optimized = optimizer.compile(StartupAnalyzer(), trainset=train_examples)
```

Hand DSPy some examples of good outputs. It runs experiments, finds what works, builds the prompt. You review the results. That's it.

## Why This Matters

If you've spent any time in production LLM systems, you know the pain. Prompts are brittle. Model updates break things. You can't version control a prompt the same way you version control code. You can't write unit tests for a prompt the same way you test functions.

DSPy doesn't solve all of this. But it moves the abstraction up one level. You're still working with LLMs. But you're programming them, not prompting them.

The difference between raw SQL scattered through your codebase and an ORM. One is brittle, untyped, hard to refactor. The other is structured, testable, maintainable.

## When DSPy Makes Sense

- You're building something real, not a demo
- You need reliability, not "it works sometimes"
- You want to swap models without rewriting everything
- You're tired of the prompt treadmill

## Why I Wrote a Guide

I spent two years learning DSPy by hitting every error message, debugging every silent failure, and rewriting every prompt that "worked in testing."

I wrote down everything I learned. Practical stuff. Real code. The things nobody explains in documentation.

It's called [Harmless DSPy](https://harmlessdspy.com). Chapter 1 is free if you want to see if it's your thing.

DSPy is developed by Omar Khattab and team at Stanford NLP. It's open source, actively maintained, and genuinely changed how I build with LLMs.

---

*If you're interested in DSPy, I also wrote about [using DSPy with GPT Vision](/using-dspy-with-gpt-vision/) for extracting structured data from images, and [building knowledge graphs with DSPy](/building-knowledge-graphs-using-dspy/).*