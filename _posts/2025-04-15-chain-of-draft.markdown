---
layout: post
title: "Chain of Draft (CoD): Making LLMs Think Like Humans on a Deadline"
description: "A new prompting strategy that makes LLMs think like humans on a deadline"
date: 2025-04-15
tags: [llm, prompt-technique, chain-of-thought, chain-of-draft]
image: "images/chain-of-draft.jpg"
---

Ever watched someone solve a tough problem while pacing, scribbling half-sentences, muttering "carry the two..." under their breath? That’s how we humans reason. We don’t narrate full essays in our heads. We sketch ideas. And that's *exactly* the vibe of Chain of Draft (CoD).

CoD is like giving your LLM a sticky note and saying: “Solve this, but keep it tight. No TED Talks.”

### So what is Chain of Draft, really?

It’s a prompting strategy from a recent paper ["Chain of Draft: Thinking Faster by Writing Less"](https://arxiv.org/abs/2502.18600). Instead of long-winded Chain of Thought (CoT) answers where the model explains every mental detour, CoD asks it to reason in fast, minimal bursts—5 words max per step.

Imagine you’re doing mental math in a checkout line and the person behind you is sighing loudly. That’s CoD.

### Why should you care?

Because:

- You get the same accuracy (sometimes better)
- You save on tokens (92% fewer, no joke)
- You get answers faster (less to compute = more speed)
- It works on logic, arithmetic, QA, multi-hop tasks

This is ideal when your app’s running a fleet of agents and one of them decides to write a memoir. CoD stops the oversharing.

### The Showdown: CoD vs CoT

| Feature              | Chain of Thought (CoT) | Chain of Draft (CoD)           |
| -------------------- | ---------------------- | ------------------------------ |
| **Style**            | Rambling essay         | Bullet points with a mission   |
| **Token Usage**      | High                   | Low (like, *really* low)       |
| **Speed**            | Slower                 | Fast and snappy                |
| **Accuracy**         | Great                  | Also great                     |
| **Cost**             | \$\$\$                 | \$                             |
| **Interpretability** | High                   | Medium (still readable though) |

### Try it Yourself

{% highlight python %}
import os
from openai import OpenAI

# Initialize the OpenAI client with your API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def chain_of_draft_prompt(question):
    return f"""You're a reasoning expert. Solve this problem using extremely 
    short steps (5 words max). Then, give the answer.

    Question: {question}

    Steps:
"""

# Create a chat completion
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": chain_of_draft_prompt("What’s 23 * 17?")}
    ],
    temperature=0.3
)

# Print the assistant's reply
print(response.choices[0].message.content)
{% endhighlight %}

### TL;DR

Chain of Draft is the minimalist cousin of CoT. It doesn't talk much, but it gets things done.

Use it when:

- You want results, not rambling
- You're running at scale
- Token bills are getting ridiculous
- Your agents are thinking like poets, not engineers
