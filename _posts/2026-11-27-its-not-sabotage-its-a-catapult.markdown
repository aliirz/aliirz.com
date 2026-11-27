---
layout: post
title: "It's not sabotage. It's a catapult."
description: "Omar Khattab, who created DSPy, says plenty of people would rather believe Claude is sabotaging their experiments than admit agents are still unreliable. The replies are better than the take, and DSPy 3.5 quietly handed everyone a second catapult."
date: 2026-11-27
tags: [dspy, ai-agents, evaluation, llm, python]
image: "images/its-not-sabotage-its-a-catapult-header.jpg"
---

Omar Khattab, who created DSPy, [posted this last night](https://x.com/lateinteraction/status/2126057001964704241):

> my timeline is full of folks who would rather believe that Claude is sabotaging their ML experiments and not simply that frontier agents are still disappointingly unreliable at sustained goal-oriented work

It had about 1,200 likes this morning. Under it, plenty of people explained, with great confidence, why he was wrong. A few others skipped the argument and left debugging tips, which turned out to be the good part.

I'm not going to adjudicate whether any model has ever done anything on purpose. That's a different post and a different pay grade. I want to talk about the other half of his sentence, the boring half, because it's the half you can do something about. DSPy is the library I reach for first, and my team uses it on most of our projects. So this is a post about a thing I'd rather have in a pipeline than a theory.

---

## The catapult

Omar followed his tweet with [a reply](https://x.com/lateinteraction/status/2126058515756392685), then a [repost of an older analogy](https://x.com/lateinteraction/status/2126058949631955426) with the words "my odd little analogy from a while back still holds." Here's the reply:

> it isn't as hard to "model" LLMs as people make it out to be. the more unusual & long-tail your goal, the longer & messier your context, the less verifiable your intermediate steps are (ie, no Lean), the more these things will disappoint you and require heavy supervision for now

And here's [the analogy itself](https://x.com/lateinteraction/status/2101433590248837568), from September:

> my quick and dirty analogy for the model's flavor of jaggedness in 2026 is kind of like...
>
> if you ask for a taxi ride but someone hands you a catapult that is highly pre-aimed on a very small number of destinations in advance
>
> initially, you're super impressed by the speed and distance of transportation, but you can never quite use it to land at your actual freaking destination, no matter how many times you're willing to get thrown flying through the air :/

I laughed. Then I read the reply again, and the joke turned into a spec.

A catapult has one checkpoint, the landing. A taxi has a steering wheel. The difference between them isn't the engine. It's how many times per trip somebody gets to look out the window.

![Two lanes. Top: a catapult throws a long dotted arc and lands short of the destination, with no checks along the way. Bottom: a taxi route with six checkpoints, the third marked as failed and caught]({{ "/images/catapult-taxi-lanes.png" | relative_url }})
*The catapult is Omar's. The checks are the part you add.*

"The less verifiable your intermediate steps are." Read that as an instruction. If long runs go wrong in proportion to how unverifiable the middle is, then the job is to make the middle verifiable. That is, more or less, what DSPy has been trying to get you to do since before agents were a thing.

---

## The reply section brought receipts

Back to the replies. Past the people who skipped the second half of the sentence, a few were doing quiet engineering.

| What you tell yourself | What a reply says it usually is | The check it implies |
| --- | --- | --- |
| "It sabotaged the run." | [@drborismichel](https://x.com/drborismichel/status/2126219688673976759): "Sabotage would be an exciting story. 🥷 Sadly it mostly is: 'step 37 called the wrong tool'." | Make the verdict quote a step. |
| "It told me it was done." | [@dvvaliya](https://x.com/dvvaliya/status/2126217642440835287): "make every long run keep a log of what it tried and why it stopped, and 'sabotage' mostly turns into 'gave up at step 40 and said done'" | Separate *finished* from *gave up*, and check against the log. |
| "ML research is special." | [@tao_an_hpu](https://x.com/tao_an_hpu/status/2126213386795123027): "The sabotage story is testable. Give the same agent a non-ML task of similar length with the same number of checkable steps." | Run a control task. |

These are people on X telling you what they see, not measurements. I'm quoting them because each one is a check you can write down.

I wrote the first two down.

---

## A small judge, in DSPy

The idea: a tiny module that reads an agent's run log and decides how the run actually ended. The verdict is a closed set. One of the options is `sabotage`, because I'd like the conspiracy to at least have to fill in a form. And the module has to quote a step.

```python
import re
from typing import Literal

import dspy


class Triage(dspy.Signature):
    """Read an agent run log. Decide how the run actually ended, and cite the step."""

    log: str = dspy.InputField()
    verdict: Literal["finished", "gave_up", "wrong_tool", "flaked", "sabotage"] = dspy.OutputField()
    evidence: str = dspy.OutputField(desc="quote the step that justifies the verdict, e.g. 'step 37: ...'")


class TriageRun(dspy.Module):
    def __init__(self):
        self.triage = dspy.Predict(Triage)

    def forward(self, log):
        return self.triage(log=log)
```

That's the Signature doing its one job: saying where you want to land. Typed fields, a closed set, no prompt folklore.

Now the steering wheel. DSPy has two ways to put a check in the middle, and they do different jobs. `dspy.Refine` is the taxi's window: run the module, score the result, try again if the score is low. GEPA is the garage: it uses your failures to rewrite the instructions.

```python
def cites_a_step(args, pred):
    """Refine's reward_fn: no step number, no credit."""
    return 1.0 if re.search(r"step\s*\d+", pred.evidence.lower()) else 0.0


def metric(gold, pred, trace=None, pred_name=None, pred_trace=None):
    """GEPA's metric: a score, and a sentence about why."""
    ok = pred.verdict == gold.verdict
    why = "right verdict" if ok else f"said {pred.verdict!r}; the log says {gold.verdict!r}. Quote the step."
    return dspy.Prediction(score=float(ok), feedback=why)


guarded = dspy.Refine(module=TriageRun(), N=3, reward_fn=cites_a_step, threshold=1.0)
optimizer = dspy.GEPA(metric=metric, auto="light", reflection_lm=dspy.LM("<your reflection model>"))
# optimizer.compile(TriageRun(), trainset=train, valset=val)
```

Two things are worth noticing. The reward function is boring on purpose: a regex. It can't be talked into anything. And the GEPA metric returns a *sentence*, not just a number. The score says how bad it was. The sentence tells the optimizer what to do about it.

I ran the pieces of this against a fake LM, `dspy.utils.DummyLM`, on DSPy 3.5.0. The first try said `sabotage` with the evidence "it just felt deliberate" and scored 0.0. The second quoted `step 37: called search() instead of run_tests()` and scored 1.0. `Refine` and `GEPA` I only constructed. I haven't pointed this at a real model or a real pile of logs, so I have no accuracy to brag about. It's a shape, not a result.

(One small footgun for anyone who tries to script `Refine` offline: it makes its own advice call to the model between tries, so a fake LM with a fixed script of answers drifts out of step. Test the reward function and the metric directly. They're plain functions.)

---

## Omar's other joke, which is also a checkpoint

A few weeks earlier Omar [wrote](https://x.com/lateinteraction/status/2120310190654316934):

> AI progress this month is crazy man, claude now writes 100% of my weight edits but ofc i still review the diffs

Same idea, wearing a party hat. The author of the library whose whole pitch is "stop hand-tuning prompts" is describing a workflow where the machine does all the typing and a human still looks at the diff. That's not a contradiction. That's the taxi.

---

## The week DSPy got 85% smaller

Which brings me to the second catapult, and it's a polite one.

On November 10, Isaac Miller [announced](https://x.com/isaacbmiller1/status/2120192241138541053) DSPy 3.5:

> DSPy is now 85% smaller!
>
> We just released DSPy 3.5 which makes DSPy lighter, faster, and a more reliable experience out of the box.

Omar's [quote of it](https://x.com/lateinteraction/status/2120195760234844603) added: "DSPy 3.5 (and efforts for DSPy 4 underway…)". The [release notes](https://github.com/stanfordnlp/dspy/releases/tag/3.5.0) have the receipts, with the usual caveat that these are the project's own measurements of a 3.5 development snapshot against 3.3.0:

| Measured default install | 3.3.0 | 3.5 dev snapshot |
| --- | --- | --- |
| Installed package files, incl. bytecode | 206.7 MiB | 30.9 MiB |
| Dependencies, excluding DSPy | 65 | 25 |
| Fresh-process import, best of ten | 1.01 s | 0.49 s |

206.7 down to 30.9 is where the 85% comes from. LiteLLM and the OpenAI library became optional, and `dspy.RLM`, `dspy.Flex` and `dspy.GEPA` graduated from experimental. That's all good news.

The announcement also says something I found honest and rather charming. In a screenshot that came with it:

> Since its introduction in 2023, DSPy's Signature interface hasn't changed even as AI accelerated dramatically, and many 2022 programs still work on today's language models.

and, a paragraph later, "It isn't our flashiest release and contains a few breaking changes."

The Signature stayed put. The prompt didn't. From the release notes:

> XMLAdapter now formats and parses predictor calls by default, changing prompts and the output contract even when your Signature stays the same.

and, at the top of the page, "This release changes prompts, defaults and APIs. [...] re-evaluate optimized programs."

If you've spent a week compiling a program with GEPA, you didn't optimize a Signature. You optimized a prompt, against a particular rendering of that Signature, with a particular model. That's a catapult, pre-aimed. Change the adapter, and somebody nudged the launcher.

Here's what the model actually sees for the same `Triage` signature, same input, in both adapters. I rendered this with `adapter.format(...)` on DSPy 3.5.0:

![Two dark panels side by side. Left, ChatAdapter: double-bracket field markers around the log, then an instruction to respond starting with the verdict field. Right, XMLAdapter: log in XML tags, then an output format block with verdict tags]({{ "/images/catapult-taxi-adapters.png" | relative_url }})
*Same Signature, same input. Different thing for the model to read.*

The cheap defence is the same defence as everywhere else in this post. Put a check at the hop. Load what you saved, run your eval under each adapter, and look at the number before you trust the upgrade:

```python
def exact(gold, pred, trace=None):
    return pred.verdict == gold.verdict

program = TriageRun()
program.load("triage_optimized.json")  # what your optimizer wrote before the upgrade

evaluate = dspy.Evaluate(devset=devset, metric=exact, num_threads=8)

for name, adapter in [("ChatAdapter", dspy.ChatAdapter()), ("XMLAdapter", dspy.XMLAdapter())]:
    with dspy.context(adapter=adapter):
        print(name, evaluate(program).score)
```

If the old one wins on your data, pin it in your app's setup, and re-optimize when you have time:

```python
dspy.configure(adapter=dspy.ChatAdapter())
```

I tried both snippets with the dummy LM, so the scores they printed were meaningless. The point is that the line exists. I haven't yet run this comparison on one of our own optimized programs.

---

## What I'd take from the thread

Three small things, none of them heroic.

1. **Make the verdict quote its evidence.** A model that has to say "step 37" can be checked. A model that can say "it felt deliberate" can't.
2. **Treat an optimized prompt as a build artifact.** It was compiled against something: a model, an adapter, a version. Re-run the eval when any of those change. The release notes literally say to.
3. **Run the control task.** @tao_an_hpu's version is the one I'd want to try first. Same agent, a non-ML job of similar length with the same number of checkable steps. If it derails at the same rate, you don't have a saboteur. You have a catapult.

Omar's right that the models are still disappointing at long, unverifiable work. The part I like is that his sentence has a fix hidden inside it: the less verifiable the middle, the worse it goes. So make the middle more verifiable. That's not a theory about models. It's a to-do list, and for once it's short.

I haven't run this judge on real traces yet. That's the next experiment. I'll write it up when it exists.

---

## Resources

- Omar Khattab: [the sabotage post](https://x.com/lateinteraction/status/2126057001964704241), [the reply](https://x.com/lateinteraction/status/2126058515756392685), [the taxi and catapult analogy](https://x.com/lateinteraction/status/2101433590248837568)
- [DSPy 3.5.0 release notes](https://github.com/stanfordnlp/dspy/releases/tag/3.5.0)
- [Isaac Miller's 3.5 announcement](https://x.com/isaacbmiller1/status/2120192241138541053)
- My earlier DSPy writeup: [DSPy: The Framework for Programming LLMs (Not Prompting Them)](https://aliirz.com/dspy-the-framework-for-programming-llms), and [Harmless DSPy](https://harmlessdspy.com)
