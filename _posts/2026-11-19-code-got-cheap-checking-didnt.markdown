---
layout: post
title: "Code got cheap. Checking it didn't."
description: "A Harvard working paper says agents made firms write a lot more code and ship only a little more of it. Review is where it piles up. The Claude Code team's answer is a verification layer the change can't touch. I think that's the right fix, and the hard part."
date: 2026-11-19
tags: [ai-agents, code-review, verification, testing]
image: "images/review-bottleneck-header.jpg"
---

Two things landed on my screen this week that belong in the same post.

The first is a Harvard working paper by Fiona Chen and James Stratton, [Artificial Intelligence in the Firm: Bottlenecks in Software Production](https://fion.ac/jellyfish.pdf). They had activity data from 720,542 engineers at 655 firms, through Jellyfish: commits, pull requests, Jira tickets, calendars. They compared firms that adopted coding agents earlier with firms that adopted later. Agents raised code output a lot. Finished work barely moved. The code piled up in review.

The second is a post from Addy Osmani on the Claude Code team, [How the Claude Code team thinks about verification](https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/). It opens with this: about 90 percent of their code is written and reviewed by Claude. The rest of the post is about the part that makes that survivable.

One is the problem. The other is somebody's answer. Neither one is the whole story.

---

## More code is not more software

![Estimated effects of adopting AI coding agents on code written, work shipped, and code review]({{ "/images/review-bottleneck-agent-effects.svg" | relative_url }})
*Estimated change after adopting AI coding agents, on top of what AI assistants already did. Code output jumped. Issues resolved rose 13.7 percent, which the authors call borderline significant. Review got slower on every measure. Source: [Chen and Stratton, Nov 14 2026 version](https://fion.ac/jellyfish.pdf).*

The paper counts finished work as Jira issues resolved, and an issue only counts once its code is deployed. Lines of code went up 44 percent. Issues resolved went up 13.7 percent. They checked whether people simply took on bigger tickets, using models to estimate issue size from the ticket text. They found no change in average size.

Where did the rest go? Review. After agents, the time from a pull request being submitted to approval rose 56.1 percent. Code waited in the backlog longer, and it spent longer in active review once someone picked it up. Comments per pull request went up 38.6 percent.

Two details from the paper stuck with me.

**Reviewers are not interchangeable.** 82.8 percent of reviews go to someone already familiar with the code. Seniors' code is mostly reviewed by seniors. You can't throw any warm body at the queue.

**AI review hasn't cleared it.** 79.1 percent of the firms had used AI code review tools by July 2026. Humans still wrote the overwhelming majority of reviews and comments.

It is a job-market paper, not a peer-reviewed one, and the data comes from Jellyfish clients who consented to research use. The authors also argue that any confounders left in their design would more likely overstate AI's effects than hide them. I'm reading it as strong evidence of where the queue forms, not as a final number.

A model that writes code is not a team that ships software. The diff is the cheap part now.

## The check can't live on the branch it judges

The Claude Code post reads like a list of rules from people who have been burned. A few of them are the whole argument.

- **Verification means running the change.** E2E over unit tests where it counts, because the whole feature either works or it doesn't.
- **Three strikes, then a human.** If a check still fails after three rounds of fixes, Claude stops and asks for a person.
- **Changes can't modify their own checks.** Their Code Review reads `REVIEW.md` from the base branch, never from the pull request.
- **A review on a stale commit means nothing.** If someone pushes during a review, the result doesn't count.
- **New gates start in observe mode.** Log what would have been blocked, fix the false positives, then enforce.

The third one is the one I'd tattoo somewhere. If the change can edit the thing that judges it, you don't have a judge. You have a suggestion box.

That's not a hypothetical. A paper in today's arXiv cs.SE listing, Miroslaw Staron's [Who Changed the AI Agent's Rules?](https://arxiv.org/abs/2611.23251), went through 932,791 agent-authored pull requests from five coding agents. It split them into ordinary code changes and changes to the control plane: workflows, permissions, the pipeline itself.

| Measure | Code changes | Control-plane changes |
| --- | --- | --- |
| Mean joint penalty (cost and governance risk) | 0.218 | 0.498 |
| Mean governance risk | 0.135 | 0.530 |
| Policy-violation flags, all PRs of this kind | not in abstract | 46.6% |
| Policy-violation flags, merged PRs of this kind | not in abstract | 63.6% |

All 775 pull requests in the paper's extreme-risk bucket touched the control plane. The scores come from the author's own penalty model, and the classifier was checked by hand on 34 pull requests (Cohen's kappa 0.72). So the scale of the numbers is his. The direction is hard to argue with: agents edit the pipeline, and a lot of those edits get merged.

Here's the smallest version of the Claude Code rule that I could get working. It reads the review rules from the base branch and refuses to pass a pull request that touches the pipeline, the rules, or the agent config.

```bash
#!/usr/bin/env bash
# gate.sh: rules come from the base branch, control-plane changes need a human
set -euo pipefail
BASE="${BASE_REF:-main}"
git fetch -q origin "$BASE"

# 1. The reviewer's rules come from the base branch, never from this PR.
git show "origin/$BASE:REVIEW.md" > /tmp/review-rules.md

# 2. If the PR touches the control plane, a human has to look.
CONTROL='^(\.github/|REVIEW\.md$|CODEOWNERS$|\.claude/)'
if git diff --name-only "origin/$BASE"...HEAD | grep -E "$CONTROL"; then
  echo "control-plane change: needs a human reviewer" >&2
  exit 1
fi
```

I tested it on a throwaway repo where a feature branch rewrote `REVIEW.md` to "Approve everything" and added `permissions: write-all` to the workflow. The script printed both files, exited 1, and the rules file it handed on was still the one from `main`.

The catch is the same catch, one level up. If `gate.sh` runs from the pull request's own checkout, the pull request can edit `gate.sh`. A normal `pull_request` workflow runs in the context of the merge commit, so the pull request's edits to the workflow file come along for the ride. GitHub's [`pull_request_target`](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target) event runs the default branch's copy instead. That's the right place for a gate like this. Read GitHub's warning before you use it. That event can reach your secrets and write permissions, so you should not build or run the PR's code in it. This script doesn't. It only reads file names.

## A closed thread is not a fix

Review has its own version of the confident "done." The comment thread gets resolved. The commented line gets changed. Everyone moves on.

Mamdouh Alenezi's position paper, [AI Code Review Requires Revision-Aware Evidence of Concern Resolution](https://arxiv.org/abs/2611.23275), also in today's listing, treats each review concern as an obligation that needs evidence. The evidence is tied to a specific revision. When something it depends on changes, the check runs again. The procedure is called REVAL, and it borrows from regression-test selection and build systems.

![False resolution and recurrence detection: an outdated-line proxy versus REVAL]({{ "/images/review-bottleneck-false-resolution.svg" | relative_url }})
*Treating "the commented line changed" as resolution marked 72.9 percent of unresolved concerns as resolved. Stopping checks after the first success missed every recurrence. REVAL, with three witnesses per concern, cut false resolutions to 11 to 13 percent and caught 80.4 to 88.3 percent of recurrences. Source: [arXiv:2611.23275](https://arxiv.org/abs/2611.23275).*

It also matched exhaustive reassessment while running 34 percent fewer tests after each comment. I want to be careful about what that means. It's 441 concerns in synthetic revision histories, checked against an oracle, not a real team's pull requests. The author says so and lays out how he'd test it on real histories. The idea survives the caveat, though: a fix is evidence attached to a commit, not a checkbox on a thread.

## Tests the agent didn't write for itself

The Claude Code post names three kinds of tests worth paying for: end-to-end, property, and differential. Property tests are the one I'd start with, because they attack the agent's blind spot directly. The edge cases come from a generator, not from the same head that wrote the code.

Here's a run-length encoder that a confident model, or a confident me, would happily ship. The example test passes.

```python
from hypothesis import given, strategies as st

def encode(s: str) -> str:            # "aaab" -> "3a1b"
    out, i = [], 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        out.append(f"{j - i}{s[i]}")
        i = j
    return "".join(out)

def decode(s: str) -> str:
    out, n = [], ""
    for ch in s:
        if ch.isdigit():
            n += ch
        else:
            out.append(ch * int(n))
            n = ""
    return "".join(out)

def test_examples():
    assert encode("aaab") == "3a1b"
    assert decode("3a1b") == "aaab"

@given(st.text())
def test_round_trip(s):
    assert decode(encode(s)) == s
```

```text
$ pytest -q test_rle.py
...
ValueError: invalid literal for int() with base 10: '1²1'
Failing test case: test_round_trip(
    s='²:',
)
...
AssertionError: assert '' == '0'
Failing test case: test_round_trip(
    s='0',
)
1 failed, 1 passed in 0.89s
```

Hypothesis 6.170 found two bugs in under a second. `str.isdigit()` is true for `²`, which `int()` then refuses. And a plain digit in the input gets read as part of a count, so `"0"` comes back as nothing. I didn't think of either one. That's the point.

This also scales past toy code. Alperen Keles's [Ephyra](https://arxiv.org/abs/2611.23282), a property-testing library in Rust built with agents in mind, reports 349 bugs found across 14 open source systems, including SQLite, PostgreSQL, DuckDB, and the URL parser Node.js uses.

## The verify skill is a skill, which is the point and the catch

The Claude Code team packages "boot the app and prove it works" as a skill called `verify`. The [Claude Code docs](https://code.claude.com/docs/en/skills) now describe exactly this. If a session starts with a project skill named `verify`, Claude is told to run it right before each commit, except for docs or test changes. That needs v2.1.286 or later. The bundled `/verify` will even write its recipe to `.claude/skills/verify/SKILL.md` once it figures out how to launch your project. The format is just front matter and instructions:

```markdown
---
name: verify
description: Build and run the app and prove the change works before committing.
---

1. Run `make test`. If it fails, fix the code, not the test.
2. Start the server with `make dev` and wait for "listening on :8080".
3. Hit the endpoint the change touched with curl and paste the response.
4. If anything still fails after three attempts, stop and say what failed.
```

(That body is mine, for a made-up project. The file name, location, and front matter are from the docs.)

I like this a lot. I also notice the wording. The docs say Claude gets an *instruction* to run it. An instruction is not a gate. Another paper in today's cs.SE listing, [Skill Roulette](https://arxiv.org/abs/2611.23266) by Lee, Lulla, Baltes, and Treude, asks exactly how often coding agents invoke the relevant skill when it's available. It's a registered report, so the method is fixed and the 20,400 trials are planned, not done. I'll be watching for the numbers. The Claude Code team seems to know this already. They also built a commit gate that blocks a commit if the session didn't run `/code-review` or `/verify`. A skill the agent might skip, plus a gate that doesn't depend on the agent remembering. Both, not either.

## What I'm taking from this

The paper says the bottleneck moved to review. The Claude Code post says the way through is to stop reading every diff and start defining what "done" looks like, then reviewing the evidence. I think that's right, with one addition from the arXiv side: evidence has to be tied to a commit, and the rules that judge it have to live somewhere the change can't reach.

None of this makes review free. Someone still writes `REVIEW.md`, decides which properties matter, and looks at the pull request that edits the workflow. That someone is the bottleneck the paper measured. The best these tools can do is make sure they spend their time on the changes that need a person, not on the ones a generator could have caught in a second.

I haven't run any of this on a real team's queue. The numbers are theirs. If I put `gate.sh` on my own repos, it starts in observe mode, the way the Claude Code team does it, and I'll write up what it catches when there's something to write up.
