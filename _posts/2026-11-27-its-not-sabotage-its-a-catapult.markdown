---
layout: post
title: "Six things people hand-build around LLM calls that DSPy already does"
description: "JSON-parsing regexes, retry loops, pasted few-shot examples, a prompt file per model and a home-made agent loop. Here is the DSPy 3.5 code that replaces each one, and what you get to delete."
date: 2026-11-27
tags: [dspy, llm, python, engineering]
image: "images/six-things-dspy-header.jpg"
---

In a lot of LLM code the call to the model is one line, and the code around it runs to a few hundred. There is a regex that digs JSON out of the reply and a retry loop for when the regex finds nothing. Next to them sit a string of few-shot examples somebody picked months ago and a folder of prompts with one file per model. Each piece made sense on the day it was written. Together they are hard to change, because nobody is sure which line is doing the work.

DSPy is one of my favourite libraries, and my team uses it on most of our projects. Most of that surrounding code already exists in DSPy as a class or a function, so this post goes through six of those pieces. For each one there is a short version of what people usually write, the DSPy version, and what changes for the engineer who has to maintain it.

The running example is a small classifier that reads an agent's run log and says how the run ended: finished, gave up, called the wrong tool or flaked. Every DSPy snippet here runs on DSPy 3.5.0 against `dspy.utils.DummyLM`, a fake model that returns canned answers. That checks the code constructs and runs. It says nothing about accuracy on a real model.

---

## 1. Asking for JSON and parsing it with a regex

What people write:

{% raw %}
```python
prompt = f"""You are an expert at reading agent logs.
Classify how this run ended. Respond ONLY with JSON like
{{"verdict": "finished|gave_up|wrong_tool|flaked", "step": <int>, "evidence": "..."}}
IMPORTANT: Do not wrap the JSON in markdown.

Log:
{log}"""

raw = client.chat.completions.create(
    model="gpt-4o", messages=[{"role": "user", "content": prompt}]
).choices[0].message.content

match = re.search(r"\{.*\}", raw, re.DOTALL)
data = json.loads(match.group(0)) if match else {}
verdict = data.get("verdict", "flaked").lower().strip()
if verdict not in {"finished", "gave_up", "wrong_tool", "flaked"}:
    verdict = "flaked"
step = int(data.get("step", -1))
```
{% endraw %}

The DSPy version:

```python
from typing import Literal

import dspy


class Triage(dspy.Signature):
    """Read an agent run log and decide how the run ended. Quote the step that shows it."""

    log: str = dspy.InputField()
    verdict: Literal["finished", "gave_up", "wrong_tool", "flaked"] = dspy.OutputField()
    step: int = dspy.OutputField(desc="the step number that justifies the verdict")
    evidence: str = dspy.OutputField(desc="the line from the log, quoted")


triage = dspy.Predict(Triage)
result = triage(log=run_log)
result.verdict  # one of the four strings
result.step     # an int
```

The prompt, the format instructions and the parsing all come from the class. The `Literal` limits the verdict to four values and `step` comes back as a real `int`, so the cleanup code at the bottom of the first snippet goes away. A bad reply also stops being silent. The hand-rolled version turns anything it can't parse into `"flaked"`, which looks like a real answer in your metrics. DSPy raises `AdapterParseError` when the reply doesn't parse into those types, including a verdict outside the four allowed values, so you see the failure where it happened.

A field can also be a Pydantic model, which helps when the output is a nested record:

```python
from pydantic import BaseModel


class Invoice(BaseModel):
    vendor: str
    total: float
    currency: Literal["USD", "EUR", "PKR"]
    line_items: list[str]


class ExtractInvoice(dspy.Signature):
    """Pull the invoice details out of a vendor email."""

    email_body: str = dspy.InputField()
    invoice: Invoice = dspy.OutputField()
```

`dspy.Predict(ExtractInvoice)(email_body=...).invoice` is an `Invoice` instance with `total` as a float.

---

## 2. The retry loop that appends "try again" to the prompt

What people write:

```python
for attempt in range(3):
    result = classify(log, prompt)
    if result["evidence"] in log:
        break
    prompt += "\nYour evidence must be copied exactly from the log. Try again."
else:
    result = {"verdict": "flaked", "step": -1, "evidence": ""}
```

The DSPy version:

```python
def quotes_the_log(args, pred):
    return 1.0 if pred.evidence and pred.evidence in args["log"] else 0.0


careful_triage = dspy.Refine(
    module=dspy.Predict(Triage), N=3, reward_fn=quotes_the_log, threshold=1.0
)
result = careful_triage(log=run_log)
```

`dspy.Refine` runs the module up to `N` times at temperature 1.0 and returns the first prediction that reaches the threshold, or the best one if none does. When an attempt scores low, Refine writes its own feedback for the next attempt, which replaces the hand-written "try again" line. If you want independent samples without that feedback step, `dspy.BestOfN` takes the same arguments. The reward function is a plain Python function, so you test it with ordinary unit tests and no model at all.

If you used `dspy.Assert` or `dspy.Suggest` in older DSPy code, they are not in 3.5.0. `Refine` and `BestOfN` are what replaced them.

---

## 3. Few-shot examples pasted into the prompt

What people write:

```python
EXAMPLES = """
Log: step 12: wrote fix. step 13: said "done" without running tests.
Answer: {"verdict": "gave_up", "step": 13, "evidence": "step 13: said \\"done\\" without running tests"}

Log: step 4: called search() instead of run_tests()
Answer: {"verdict": "wrong_tool", "step": 4, "evidence": "step 4: called search() instead of run_tests()"}
"""
# picked by hand in March, nobody remembers why these two

prompt = EXAMPLES + "\n\nLog: " + log + "\nAnswer:"
```

The DSPy version:

```python
trainset = [
    dspy.Example(log=log, verdict=verdict, step=step, evidence=evidence).with_inputs("log")
    for log, verdict, step, evidence in labelled_runs
]


def same_verdict(example, pred, trace=None):
    return example.verdict == pred.verdict


optimizer = dspy.BootstrapFewShot(metric=same_verdict, max_bootstrapped_demos=4)
compiled = optimizer.compile(dspy.Predict(Triage), trainset=trainset)
compiled.save("triage_v1.json")
```

You keep labelled data instead of a string. `BootstrapFewShot` runs your program over the training set, keeps the runs that pass your metric as examples in the prompt and fills any remaining slots with your labelled data. When the data changes you run `compile` again, and nobody has to guess which examples to swap. The output is a JSON file that you load with `program.load("triage_v1.json")`, review in a diff and version next to the code.

`dspy.MIPROv2(metric=same_verdict, auto="light")` goes a step further and rewrites the instruction as well as picking examples. It makes a lot more model calls, so check the cost on a small set first. Hamel Husain's [post on intercepting the prompts frameworks send](https://hamel.dev/blog/posts/prompt/) describes a DSPy quick-start in February 2024 that took more than 30 minutes and hundreds of OpenAI calls. That was an older version, but the habit of checking still applies.

Chapter 4 of my book, [DSPy: The Mostly Harmless Guide](https://harmlessdspy.com), covers LabeledFewShot, BootstrapFewShot, MIPROv2 and SIMBA on a ticket classifier, along with how to decide which one to use.

---

## 4. One prompt file per model

What people write:

```python
PROMPTS = {
    "gpt-4o": open("prompts/triage_gpt4o.txt").read(),
    "claude": open("prompts/triage_claude.txt").read(),  # wants XML tags
    "llama-70b": open("prompts/triage_llama.txt").read(),  # added "ONE WORD ONLY" in caps
}
prompt = PROMPTS[model_name].format(log=log)
```

The DSPy version:

```python
devset = load_labelled_runs("dev.jsonl")
evaluate = dspy.Evaluate(devset=devset, metric=same_verdict, num_threads=8)

program = dspy.Predict(Triage)
program.load("triage_v1.json")

for model in ["openai/gpt-4o-mini", "anthropic/claude-sonnet-5"]:
    with dspy.context(lm=dspy.LM(model)):
        print(model, evaluate(program).score)
```

There is one `Triage` class and the model is a setting. `dspy.context` switches it for a block of code, and `dspy.Evaluate` gives you a number per model on the same dev set. When one model needs a different prompt, compile once per model and save `triage_gpt4o.json` and `triage_claude.json`. The optimizer tunes those files from data, so nobody hand-edits them.

The same loop matters when you upgrade DSPy itself. The [3.5.0 release notes](https://github.com/stanfordnlp/dspy/releases/tag/3.5.0) say XMLAdapter is now the default adapter, which changes the prompt the model sees even when your Signature stays the same. They also tell you to re-evaluate optimized programs. With an `Evaluate` loop in place that check takes one run. If the old format scores better on your data, `dspy.configure(adapter=dspy.ChatAdapter())` switches back.

---

## 5. A home-made agent loop

What people write:

```python
TOOLS = {"run_tests": run_tests, "read_file": read_file}
history = SYSTEM_PROMPT + f"\nTask: {task}\n"

for _ in range(8):
    reply = llm(history)
    history += reply
    if "Final Answer:" in reply:
        answer = reply.split("Final Answer:")[-1].strip()
        break
    m = re.search(r"Action: (\w+)\[(.*?)\]", reply)
    if not m or m.group(1) not in TOOLS:
        history += "\nObservation: invalid action, use the format Action: tool[arg]\n"
        continue
    history += f"\nObservation: {TOOLS[m.group(1)](m.group(2))}\n"
```

The DSPy version:

```python
def run_tests(path: str) -> str:
    """Run pytest on a path and return the summary line."""
    ...


def read_file(path: str) -> str:
    """Return the contents of a file."""
    ...


agent = dspy.ReAct("task -> answer", tools=[run_tests, read_file], max_iters=8)
result = agent(task="Why is CI red on main?")
result.answer
result.termination_reason  # "submit" when the model finished on its own
```

The tool descriptions come from the function names, type hints and docstrings, so the `SYSTEM_PROMPT` that lists the tools disappears along with the `Action:` regex. ReAct keeps the history, enforces `max_iters` and records why the loop stopped, which is the first thing you want to know when an agent run goes wrong. `result.history` has every tool call and its output, so you can feed it straight into the `Triage` classifier from the first section.

---

## 6. Printing prompts to see what went out

What people write:

```python
print("=" * 80)
print(prompt)
print("-" * 80)
print(raw)
```

The DSPy version:

```python
dspy.inspect_history(n=1)
```

This prints the last call: the system message DSPy built from your Signature, the input, any examples the optimizer added and the raw reply. When a result looks wrong, this is the first thing to run. Hamel's post above makes the case for always looking at the final prompt, and he checked that `inspect_history` matched the requests he captured with mitmproxy.

---

## What you get to delete

| Hand-built pattern | DSPy feature | What you delete |
| --- | --- | --- |
| "Respond ONLY with JSON" plus a regex and `json.loads` | Signature with typed fields (`Literal`, `int`, Pydantic models) | Format instructions, the regex, the cleanup and default values |
| Retry loop that appends "try again" | `dspy.Refine` or `dspy.BestOfN` with a `reward_fn` | The loop, the appended text and the fallback dict |
| Few-shot examples in a string constant | `dspy.Example` training set and `BootstrapFewShot` or `MIPROv2` | The constant and the guesswork about which examples to keep |
| A prompt file per model | One program, `dspy.context(lm=...)`, `dspy.Evaluate`, a saved JSON per model | The `prompts/` folder and the per-model edits |
| `while` loop that parses `Action:` lines | `dspy.ReAct` with plain Python functions as tools | The tool list in the system prompt, the regex and the step counter |
| `print(prompt)` | `dspy.inspect_history` | The print statements |

If you have one of these in your code, start with the first row. Moving a prompt into a Signature removes the most code, and it gives you a program that `Evaluate` and the optimizers can work with later.

[My book](https://harmlessdspy.com) goes further on the optimizers, ReAct agents and saving compiled programs, with runnable code for every chapter. Chapter 1 is free to read on the site, and the code is on [GitHub](https://github.com/aliirz/dspy-mostly-harmless-code).
