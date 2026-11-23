---
layout: post
title: "The port passed. It was still wrong."
description: "fast-anything profiles your Python, ports the hot function to Rust, and replays real calls to prove nothing changed. I wrote a port by hand that passed 35 of 35 checks and still disagreed with Python on two kinds of input. The tool is good. The proof is only as good as the calls you feed it."
date: 2026-11-23
tags: [python, rust, performance, testing, experiment]
image: "images/fast-anything-header.jpg"
---

My Rust port passed 35 out of 35 checks. Then I threw 20,000 random inputs at it and it disagreed with the Python original on 3,341 of them.

Both of those numbers are true. Only the first one turns green.

The tool behind the green is [fast-anything](https://github.com/EL4CTEO/fast-anything), which showed up on November 21 and had 2,291 GitHub stars by this morning ([HN thread](https://news.ycombinator.com/item?id=50596155)). The pitch is on the tin: "Don't rewrite it in Rust. Rewrite the 5% that's slow." It profiles your app, picks the hot function, records real calls to it, has your coding agent (or you) write a one-function Rust crate, replays the recordings against it, and only then swaps it in.

I like this idea a lot. It's the opposite of a rewrite. It's also the kind of tool where the word "proves" is doing heavy lifting, so I wanted to see what the proof actually covers.

This is one box, two small apps, and a port I wrote myself. That's a demo. Not a benchmark.

---

## The lab

An 8-vCPU Linux box, Python 3.13.5, Rust 1.85.1, fast-anything 0.8.0 from npm. I installed it into a scratch folder instead of globally:

```bash
npm init -y && npm i @el4cteo/fast-anything@0.8.0
export PATH=$PWD/node_modules/.bin:$PATH
fast-anything doctor      # finds cargo, python, node; it doesn't need an agent
```

I ran two workloads. The first is the tool's own Python example: fuzzy-dedupe 700 names with a pure-Python Levenshtein. I used the reference Rust port that ships in the repo.

The second is mine. It reads every post in this blog's `_posts` folder (632 paragraphs over 80 characters), turns each paragraph into a set of 3-word shingles, and flags pairs that overlap by a Jaccard score of 0.3 or more. The kind of script I'd actually write to catch myself repeating paragraphs.

```python
def shingles(text: str, k: int = 3) -> set[str]:
    words = text.lower().split()
    return {" ".join(words[i:i + k]) for i in range(len(words) - k + 1)}

def near_duplicates(paragraphs: list[str], threshold: float = 0.3) -> list[tuple[int, int, float]]:
    sets = [shingles(p) for p in paragraphs]
    out = []
    for i in range(len(sets)):
        for j in range(i + 1, len(sets)):
            a, b = sets[i], sets[j]
            if not a or not b:
                continue
            score = len(a & b) / len(a | b)
            if score >= threshold:
                out.append((i, j, round(score, 3)))
    return out
```

(Three pairs, for the record. All three are code blocks: two from the Docker args-vs-env-vars post, one from the Vue inject/provide post. I don't repeat myself in prose. I repeat myself in code blocks.)

The scan is genuinely nice. It knows `load()` touches the filesystem and won't try to port it, and it knows `shingles` has to travel with its caller:

```text
$ fast-anything scan -- python3 app.py
   #  function                        time                  calls  verdict
   1  dupes.near_duplicates           ████████▉  98.6%          1  ✓ port it
                                    ! calls shingles, they get ported together with it
   2  dupes.shingles                  ▎           2.8%        632  ↳ ported inside near_duplicates
   3  app.py:load                                 0.6%          1  ✗ does I/O: glob.glob, open
```

`fast-anything port` then writes a `TASK.md` with the original source, the recorded calls and a list of rules (code points, not bytes; floats within 1e-9; raise where Python raises). It's a good brief. Better than most tickets I've written.

---

## The 5% that's slow was already fast

| Workload | Python, per call | Rust, per call | Whole app, Python | Whole app, Rust | End to end |
| --- | --- | --- | --- | --- | --- |
| fuzzy-dedupe example (their port) | 2,602 ms | 3.3 ms | 2.58 s | 17 ms | 150× |
| paragraph dedupe (my port) | 363 ms | 81.6 ms | 380 ms | 104 ms | 3.6× |

Per-call numbers come from `fast-anything verify`. Whole-app numbers come from `fast-anything bench` (median of 5 interleaved runs). The README reports 116× for the same example on a Windows i5. Mine came out at 141×, 147× and 150× across three bench runs. Different machine, same shape.

![End-to-end run time before and after fast-anything for two Python apps, log scale]({{ "/images/fast-anything-speedups.svg" | relative_url }})
*Same tool, same box. The pure-Python loop gets 150×. The script built on Python sets gets 3.6×. Source: my runs, 2026-11-23.*

The gap isn't a knock on the tool. It's what the profile was already telling me. Levenshtein in pure Python is 244,650 calls into a nested loop that does arithmetic one object at a time. My script spends its time in `a & b` and `a | b`, and Python's set operations are already C. Rust still wins, probably because the loop around the 199,396 pairs no longer runs in the interpreter, but it's beating C with a Python costume on, not Python.

3.6× on a script that takes under half a second is a nice-to-have. On a nightly job that takes an hour it's a different conversation. Profile first. The scan is free.

---

## 35 green checks

I didn't use an agent for the port. I wrote it the way I'd expect most people (and most agents) to write it on a first pass:

```rust
fn shingles(text: &str) -> HashSet<String> {
    let lower = text.to_lowercase();
    let words: Vec<&str> = lower.split_whitespace().collect();
    let mut out = HashSet::with_capacity(words.len());
    for w in words.windows(3) {
        out.insert(w.join(" "));
    }
    out
}
// ...and in the pair loop:
out.push((i as i64, j as i64, (score * 1000.0).round() / 1000.0));
```

```text
$ fast-anything verify dupes.near_duplicates
✓ 35/35 calls give the same result (1 recorded + 8 edge cases + 26 derived)
✓ dupes.near_duplicates per call: 369.5ms in Python, 82.6ms in Rust: 4.5× faster
```

Thirty-five out of thirty-five. One of those is the real call. The other 34 are cases fast-anything derived from it: per the README, things like empty input, non-ASCII text, shrunk slices and up to 16× bigger inputs. That's more than most hand-written test suites bother with.

It's also wrong in two places.

**Whitespace.** Python's `str.split()` and Rust's `split_whitespace()` don't agree on what whitespace is. I checked every code point on this box: Python treats 29 characters as whitespace, Rust treats 25. The difference is exactly four, the ASCII separators `\x1c` through `\x1f`. Python splits on them. Rust keeps them inside the word.

**Rounding.** `round(0.3125, 3)` in Python is `0.312`. Python rounds the exact binary value and breaks ties to even. `(0.3125 * 1000.0).round() / 1000.0` in Rust is `0.313`, because `f64::round` breaks ties away from zero. A Jaccard score of 5/16 is a perfectly ordinary score for two paragraphs. I compared the two approaches on every fraction p/q with q up to 2,000: 1,680 of 2,003,000 disagree.

Neither bug shows up in my blog posts. That's why the one recorded call passed, and why the derived cases (which are built from that call) passed too. Verify proved the port matches Python on inputs that look like my data. It never claimed more than that. I almost heard it as more.

![Inputs where each version of my Rust port disagrees with the Python original, by test set]({{ "/images/fast-anything-mismatches.svg" | relative_url }})
*Same port, five ways of asking. The first port is perfect on its own recordings and wrong on 16.7% of deliberately mean random input. Source: my runs, 2026-11-23.*

The fixed port is two small changes:

```rust
// Python's str.split() also splits on \x1c-\x1f. Rust's is_whitespace doesn't.
let words: Vec<&str> = lower
    .split(|c: char| c.is_whitespace() || ('\x1c'..='\x1f').contains(&c))
    .filter(|w| !w.is_empty())
    .collect();

/// Python's round(x, 3): correctly rounded, ties to even. (x * 1000).round() is not.
fn py_round3(x: f64) -> f64 {
    format!("{:.3}", x).parse().unwrap()
}
```

`format!("{:.3}")` matched Python's `round(x, 3)` on all 2,003,000 of those fractions. The fixed port also passed the same 20,000 random inputs with zero differences. I'm not calling that a proof either. It's a bigger pile of evidence.

---

## Feed verify the calls you're scared of

The good news is you don't need a separate harness to fix this. fast-anything records whatever the command you scan actually calls. So give it a workload that includes the inputs you already know are mean:

```python
# workload.py: the app's real call, plus the inputs I already know are mean
from app import load
from dupes import near_duplicates

if __name__ == "__main__":
    near_duplicates(load())
    w = [f"w{i}" for i in range(20)]
    near_duplicates([" ".join(w[0:12]), " ".join(w[5:18])], 0.0)             # Jaccard 5/16, a tie
    near_duplicates(["alpha beta\x1cgamma delta", "alpha beta gamma delta"])  # \x1c is whitespace to Python
```

```text
$ fast-anything scan -- python3 workload.py && fast-anything port dupes.near_duplicates
✓ recorded 3 real calls to dupes.near_duplicates (of 3 made)

$ fast-anything verify dupes.near_duplicates          # first port
✗ 10/56 calls don't match                             # output trimmed
    near_duplicates(['w0 w1 w2 ... w11', 'w5 w6 ... w17'], 0.0)
      expected [(0, 1, 0.312)]
      got      [(0, 1, 0.313)]

$ fast-anything verify dupes.near_duplicates          # fixed port
✓ 56/56 calls give the same result (3 recorded + 24 edge cases + 29 derived)
```

Two extra lines in the workload, and the derivation step builds on them too: the two nasty calls turned into ten failing cases (emoji-prefixed, accented and CJK-suffixed variants, plus threshold variations like `-inf`). That's the tool doing its job well once it has something to start from.

The recordings are the test suite. You didn't write it, which is the appeal, and you didn't write it, which is the catch.

---

## Two smaller things I'd want to know before shipping

**The swap fails quietly.** `enable` appends a marked block to `dupes.py` that imports the Rust module from `.fast/lib`, and falls back to the Python function on `ImportError`. `.fast/.gitignore` ignores `lib/`. So on a fresh clone, before anyone runs `fast-anything build`, the app silently runs the Python version. I checked: moving `.fast/lib` aside made `dupes.near_duplicates` a plain Python function again, no warning. That's the safe default. It's also a green light that lies by omission, so put `fast-anything build` in CI and assert you got the `<built-in function ...>`.

**Unicode versions drift.** Python 3.13.5 on this box ships Unicode 15.1 tables. Rust 1.85.1 ships Unicode 16.0. Comparing single-character `str.lower()` against `to_lowercase()` across every code point, 27 disagree, and all 27 are characters Python's 15.1 tables list as unassigned. My fixed port still has that gap. None of my inputs contain those characters, and now I'm writing it down before I pretend otherwise.

---

The win here is small and real. A scan that tells you what's worth porting and what isn't. A brief I'd happily hand to an agent. A swap you can undo with one environment variable (`FAST_ANYTHING_DISABLE=1`). And a 150× that shows up exactly where the profile says pure Python is doing arithmetic in a loop.

The proof needs one more line from you: the input you were already worried about. Matching on 500 recorded calls is evidence about those 500 calls. I wrote [a whole post](https://aliirz.com/code-got-cheap-checking-didnt) about code getting cheap while checking it stays expensive. This is the same lesson at the scale of one Rust function: writing the port was the quick part, and the boring part (deciding what to check) was still on me.

### Resources

- [fast-anything on GitHub](https://github.com/EL4CTEO/fast-anything) and the [Hacker News thread](https://news.ycombinator.com/item?id=50596155)
- Python [`str.split`](https://docs.python.org/3/library/stdtypes.html#str.split) and [`round`](https://docs.python.org/3/library/functions.html#round)
- Rust [`str::split_whitespace`](https://doc.rust-lang.org/std/primitive.str.html#method.split_whitespace) and [`f64::round`](https://doc.rust-lang.org/std/primitive.f64.html#method.round)
